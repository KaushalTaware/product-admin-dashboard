"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoutes";
import { useAuth } from "@/context/authContext";
import { getProducts } from "@/lib/productApi";

export default function ProductsPage() {
  const { user, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts({
        limit: 20,
        skip: 0,
      });

      setProducts(response.data.products);
    } catch (error) {
      console.error(error);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-100 p-4 text-black md:p-8">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black md:text-3xl">
              Products Dashboard
            </h1>

            <p className="mt-1 text-black">
              Welcome, {user?.username}
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-lg border border-gray-300 bg-white p-8 text-center text-black shadow">
            Loading products...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-lg border border-gray-300 bg-white p-8 text-center shadow">
            <p className="mb-4 text-red-600">{error}</p>

            <button
              onClick={fetchProducts}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-lg border border-gray-300 bg-white p-8 text-center text-black shadow">
            No products found.
          </div>
        )}

        {/* Desktop Table */}
        {!loading && !error && products.length > 0 && (
          <div className="hidden overflow-x-auto rounded-lg border border-gray-300 bg-white shadow md:block">
            <table className="w-full text-left text-black">
              <thead className="border-b border-gray-300 bg-gray-50">
                <tr>
                  <th className="border-b border-gray-300 px-4 py-3 text-black">Image</th>
                  <th className="border-b border-gray-300 px-4 py-3 text-black">Title</th>
                  <th className="border-b border-gray-300 px-4 py-3 text-black">Category</th>
                  <th className="border-b border-gray-300 px-4 py-3 text-black">Price</th>
                  <th className="border-b border-gray-300 px-4 py-3 text-black">Rating</th>
                  <th className="border-b border-gray-300 px-4 py-3 text-black">Stock</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td className="border-b border-gray-200 px-4 py-3 text-black">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                    </td>

                    <td className="border-b border-gray-200 px-4 py-3 font-medium text-black">
                      {product.title}
                    </td>

                    <td className="border-b border-gray-200 px-4 py-3 capitalize text-black">
                      {product.category}
                    </td>

                    <td className="border-b border-gray-200 px-4 py-3 text-black">
                      ${product.price}
                    </td>

                    <td className="border-b border-gray-200 px-4 py-3 text-black">
                      ⭐ {product.rating}
                    </td>

                    <td className="border-b border-gray-200 px-4 py-3 text-black">
                      {product.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {!loading && !error && products.length > 0 && (
          <div className="space-y-4 md:hidden">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-gray-300 bg-white p-4 text-black shadow"
              >
                <div className="flex gap-4">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-20 w-20 rounded object-cover"
                  />

                  <div className="flex-1">
                    <h2 className="font-semibold text-black">
                      {product.title}
                    </h2>

                    <p className="mt-1 text-sm capitalize text-black">
                      {product.category}
                    </p>

                    <p className="mt-2 font-medium text-black">
                      ${product.price}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-between border-t border-gray-300 pt-3 text-sm text-black">
                  <span>⭐ {product.rating}</span>
                  <span>Stock: {product.stock}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}