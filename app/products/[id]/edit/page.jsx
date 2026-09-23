"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getProduct,
  updateProduct,
} from "@/lib/productApi";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
const [originalProduct, setOriginalProduct] = useState(null);


const [form, setForm] = useState({
  title: "",
  price: "",
  stock: "",
  category: "",
  description: "",
});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
useEffect(() => {
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProduct(params.id);

      const storedProducts =
        JSON.parse(localStorage.getItem("updatedProducts")) || {};

      const updatedProduct = storedProducts[params.id];

      const product = updatedProduct || response.data;

      setOriginalProduct(product);

      setForm({
        title: product.title || "",
        price: product.price || "",
        stock: product.stock || "",
        category: product.category || "",
        description: product.description || "",
      });
    } catch (error) {
      console.error(error);
      setError("Failed to load product.");
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [params.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (saving) return;

  setError("");

  // Validation
  if (!form.title.trim()) {
    setError("Title is required.");
    return;
  }

  if (!form.price || Number(form.price) <= 0) {
    setError("Price must be greater than 0.");
    return;
  }

  if (!form.stock || Number(form.stock) < 0) {
    setError("Stock cannot be negative.");
    return;
  }

  setSaving(true);

  try {
    const response = await updateProduct(params.id, {
      title: form.title,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      description: form.description,
    });

    console.log("API response:", response.data);

    // Get existing saved products
    const storedProducts =
      JSON.parse(localStorage.getItem("updatedProducts")) || {};

    // Create complete updated product
    const updatedProduct = {
      ...response.data,

      id: Number(params.id),

      title: form.title,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
      description: form.description,
    };

    // Save updated product
    storedProducts[params.id] = updatedProduct;

    localStorage.setItem(
      "updatedProducts",
      JSON.stringify(storedProducts)
    );

    console.log("Saved product:", updatedProduct);

    router.push(`/products/${params.id}`);
  } catch (error) {
    console.error(error);
    setError("Failed to update product.");
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-black">
        Loading product...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-black md:p-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">
          Edit Product
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block font-medium">
              Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded border p-2 text-black"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Price
            </label>

            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="w-full rounded border p-2 text-black"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Stock
            </label>

            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="w-full rounded border p-2 text-black"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Category
            </label>

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded border p-2 text-black"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded border p-2 text-black"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                router.push(`/products/${params.id}`)
              }
              className="rounded border px-4 py-2 text-black"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}