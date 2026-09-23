"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProduct } from "@/lib/productApi";

export default function ProductDetailsPage() {
  const params = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
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

if (updatedProduct) {
  setProduct(updatedProduct);
} else {
  setProduct(response.data);
}
      } catch (error) {
        console.error(error);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading product...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  
   return (
  <main className="min-h-screen bg-gray-100 p-4 md:p-8">
    <div className="mx-auto max-w-6xl rounded-lg bg-white p-6 shadow">
      
      <div className="grid gap-8 md:grid-cols-2">
        
        {/* Product Image */}
        <div className="flex items-center justify-center">
          <img
            src={product.images?.[0]}
            alt={product.title}
            className="max-h-96 w-full rounded-lg object-contain"
          />
        </div>

        {/* Product Information */}
        <div>
          <p className="mb-2 text-sm capitalize text-black">
            {product.category}
          </p>

          <h1 className="text-3xl font-bold text-black">
            {product.title}
          </h1>

          <p className="mt-4 text-black">
            {product.description}
          </p>

          <div className="mt-6 space-y-3">
            <p className="text-2xl font-bold text-black ">
              ${product.price}
            </p>

            <p  className="text-black">
              <span className="font-semibold text-black">Rating:</span>{" "}
              ⭐ {product.rating}
            </p>

            <p  className="text-black">
              <span className="font-semibold text-black">Stock:</span>{" "}
              {product.stock}
            </p>

            <p className="text-black">
              <span className="font-semibold text-black">Brand:</span>{" "}
              {product.brand || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-bold text-black">
          Reviews
        </h2>

        {product.reviews?.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review, index) => (
              <div
                key={index}
                className="rounded-lg border p-4"
              >
                <p className="font-semibold text-black">
                  {review.reviewerName}
                </p>

                <p className="mt-1 text-black">
                  ⭐ {review.rating}
                </p>

                <p className="mt-2 text-black">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-black">
            No reviews available.
          </p>
        )}
      </div>
    </div>
  </main>
);

}