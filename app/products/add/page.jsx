"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProduct } from "@/lib/productApi";

export default function AddProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    category: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

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

    setLoading(true);

   try {
  const response = await addProduct({
    title: form.title,
    price: Number(form.price),
    stock: Number(form.stock),
    category: form.category,
    description: form.description,
  });

  console.log("Created product:", response.data);

  // Get existing locally added products
  const addedProducts =
    JSON.parse(localStorage.getItem("addedProducts")) || [];

  // Create complete product object
  const newProduct = {
    ...response.data,

    title: form.title,
    price: Number(form.price),
    stock: Number(form.stock),
    category: form.category,
    description: form.description,
  };

  // Store the new product
  addedProducts.push(newProduct);

  localStorage.setItem(
    "addedProducts",
    JSON.stringify(addedProducts)
  );

  router.push("/products");
}
     catch (error) {
      console.error(error);
      setError("Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-black md:p-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold text-black">
          Add Product
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-black"
        >
          <div>
            <label className="mb-1 block font-medium text-black">
              Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded border p-2 text-black placeholder:text-black"
              placeholder="Enter product title"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-black">
              Price
            </label>

            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="w-full rounded border p-2 text-black placeholder:text-black"
              placeholder="Enter price"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-black">
              Stock
            </label>

            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="w-full rounded border p-2 text-black placeholder:text-black"
              placeholder="Enter stock"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-black">
              Category
            </label>

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded border p-2 text-black placeholder:text-black"
              placeholder="Enter category"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-black">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full rounded border p-2 text-black placeholder:text-black"
              placeholder="Enter description"
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
              onClick={() => router.push("/products")}
              className="rounded border px-4 py-2 text-black"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}