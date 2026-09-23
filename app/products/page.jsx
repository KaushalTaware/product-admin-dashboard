"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState,useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoutes";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
  deleteProduct
} from "@/lib/productApi";
import {
  useRouter,
  useSearchParams,
  notFound
} from "next/navigation";

export default function ProductsPage() {
  const { user, logout } = useAuth();
  const requestIdRef = useRef(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Search input value
  const [search, setSearch] = useState("");

  // Search value after 500ms delay
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Product data
  const [products, setProducts] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  //filter
  const [categories, setCategories] = useState([]);
const [category, setCategory] = useState("");
//sort
const [sortBy, setSortBy] = useState("");
const [order, setOrder] = useState("asc");

 

  useEffect(() => {
    const urlPage = Number(searchParams.get("page"));
    const urlPageSize = Number(searchParams.get("pageSize"));
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "";
    const urlSortBy = searchParams.get("sortBy") || "";
const urlOrder = searchParams.get("order") || "asc";

    // Validate page
    const validPage =
      Number.isInteger(urlPage) && urlPage >= 1
        ? urlPage
        : 1;

    // Validate page size
    const validPageSize =
      [10, 20, 50].includes(urlPageSize)
        ? urlPageSize
        : 20;

        setSortBy(urlSortBy);
setOrder(
  ["asc", "desc"].includes(urlOrder)
    ? urlOrder
    : "asc"
);

    setPage(validPage);
    setPageSize(validPageSize);
    setSearch(urlSearch);
    setDebouncedSearch(urlSearch);
    setCategory(urlCategory);
  }, [searchParams]);


useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await getCategories();

      setCategories(response.data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  fetchCategories();
}, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);


  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(
        searchParams.toString()
      );

      // Search always starts from page 1
      params.set("page", "1");

      if (search.trim()) {
        params.set("search", search.trim());
      } else {
        params.delete("search");
      }

      router.push(`/products?${params.toString()}`);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);
const getUpdatedProducts = (apiProducts) => {
  const storedProducts =
    JSON.parse(localStorage.getItem("updatedProducts")) || {};

  return apiProducts.map((product) => {
    return storedProducts[product.id] || product;
  });
};
const handleDelete = async (productId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed) return;

  try {
    setError("");

    const addedProducts =
      JSON.parse(localStorage.getItem("addedProducts")) || [];

    const isAddedProduct = addedProducts.some(
      (product) => Number(product.id) === Number(productId)
    );

    // If it is a locally added product
    if (isAddedProduct) {
      const remainingProducts = addedProducts.filter(
        (product) => Number(product.id) !== Number(productId)
      );

      localStorage.setItem(
        "addedProducts",
        JSON.stringify(remainingProducts)
      );

      setProducts((previousProducts) =>
        previousProducts.filter(
          (product) => Number(product.id) !== Number(productId)
        )
      );

      return;
    }

    // Otherwise, delete the DummyJSON product
    await deleteProduct(productId);

    const deletedProducts =
      JSON.parse(localStorage.getItem("deletedProducts")) || [];

    const updatedDeletedProducts = [
      ...new Set([...deletedProducts, productId]),
    ];

    localStorage.setItem(
      "deletedProducts",
      JSON.stringify(updatedDeletedProducts)
    );

    setProducts((previousProducts) =>
      previousProducts.filter(
        (product) => Number(product.id) !== Number(productId)
      )
    );
  } catch (error) {
    console.error("Delete error:", error);
    setError("Failed to delete product.");
  }
};
 
const fetchProducts = async () => {
  const requestId = ++requestIdRef.current;

  try {
    setLoading(true);
    setError("");

    const skip = (page - 1) * pageSize;

    let response;

    // Sorting parameters
    const sortParams = {};

    if (sortBy) {
      sortParams.sortBy = sortBy;
      sortParams.order = order;
    }

    // Search
    if (debouncedSearch.trim()) {
      response = await searchProducts({
        q: debouncedSearch.trim(),
        limit: pageSize,
        skip: skip,
        ...sortParams,
      });
    }

    // Category
    else if (category) {
      response = await getProductsByCategory(
        category,
        {
          limit: pageSize,
          skip: skip,
          ...sortParams,
        }
      );
    }

    // Normal products
    else {
      response = await getProducts({
        limit: pageSize,
        skip: skip,
        ...sortParams,
      });
    }

    // Ignore old response
    if (requestId !== requestIdRef.current) {
      return;
    }
const storedProducts =
  JSON.parse(localStorage.getItem("updatedProducts")) || {};

const deletedProducts =
  JSON.parse(localStorage.getItem("deletedProducts")) || [];

const updatedProducts = response.data.products
  .filter(
    (product) =>
      !deletedProducts.includes(Number(product.id))
  )
  .map((product) => {
    return storedProducts[product.id] || product;
  });
  const addedProducts =
  JSON.parse(localStorage.getItem("addedProducts")) || [];

const allProducts =
  page === 1
    ? [...addedProducts, ...updatedProducts]
    : updatedProducts;

setProducts(allProducts);




// Count only deleted products that exist in the API result
const deletedFromCurrentResult =
  response.data.products.filter((product) =>
    deletedProducts.includes(Number(product.id))
  ).length;

setTotal(
  response.data.total - deletedFromCurrentResult
);
  } catch (error) {
    console.error(error);

    if (error.response?.status === 404) {
    notFound();
  }

  setError("Failed to load product.");

  } finally {
    // Only latest request controls loading
    if (requestId === requestIdRef.current) {
      setLoading(false);
    }
  }
};

  // Fetch whenever pagination or debounced search changes
  useEffect(() => {
    fetchProducts();
  }, [page, pageSize, debouncedSearch,category,sortBy,order]);

  // Total number of pages
  const totalPages = Math.ceil(total / pageSize);
  

  
  const updatePagination = (
    newPage,
    newPageSize = pageSize
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("page", String(newPage));
    params.set("pageSize", String(newPageSize));

    router.push(`/products?${params.toString()}`);
  };
useEffect(() => {
  if (totalPages > 0 && page > totalPages) {
    updatePagination(totalPages);
  }
}, [page, totalPages]);

  useEffect(() => {
  const params = new URLSearchParams(
    searchParams.toString()
  );

  params.set("page", "1");

  if (category) {
    params.set("category", category);
    params.delete("search");
  } else {
    params.delete("category");
  }

  router.push(`/products?${params.toString()}`);
}, [category]);
  
useEffect(() => {
  const params = new URLSearchParams(
    searchParams.toString()
  );

  params.set("page", "1");

  if (sortBy) {
    params.set("sortBy", sortBy);
    params.set("order", order);
  } else {
    params.delete("sortBy");
    params.delete("order");
  }

  router.push(`/products?${params.toString()}`);
}, [sortBy, order]);
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-100 p-4 text-black md:p-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Products Dashboard
            </h1>

            <p className="mt-1">
              Welcome, {user?.username}
            </p>
          </div>

          <div>
<button
  onClick={() => router.push("/products/add")}
  className="rounded bg-black px-4 py-2 m-5 text-white"
>
  Add Product
</button>
          <button
            onClick={logout}
            className="rounded bg-red-600 px-4 py-2.5  text-sm text-white hover:bg-red-700"
          >
            Logout
          </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <label className="mb-2 block text-sm font-medium">
            Search Products
          </label>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
          />

          <div className="mt-4">
  <label className="mb-2 block text-sm font-medium">
    Category
  </label>

  <select
    value={category}
    onChange={(e) => {
      const newCategory = e.target.value;

      setCategory(newCategory);

      if (newCategory) {
        setSearch("");
        setDebouncedSearch("");
      }
    }}
    className="w-full rounded border px-3 py-2"
  >
    <option value="">
      All Categories
    </option>

    {categories.map((item) => (
      <option
        key={item.slug}
        value={item.slug}
      >
        {item.name}
      </option>
    ))}
  </select>
</div> 
<div className="mt-4 grid gap-4 md:grid-cols-2">

  {/* Sort By */}
  <div>
    <label className="mb-2 block text-sm font-medium">
      Sort By
    </label>

    <select
      value={sortBy}
      onChange={(e) => {
        setSortBy(e.target.value);
      }}
      className="w-full rounded border px-3 py-2"
    >
      <option value="">
        Default
      </option>

      <option value="title">
        Title
      </option>

      <option value="price">
        Price
      </option>

      <option value="rating">
        Rating
      </option>
    </select>
  </div>

  {/* Order */}
  <div>
    <label className="mb-2 block text-sm font-medium">
      Order
    </label>

    <select
      value={order}
      onChange={(e) => {
        setOrder(e.target.value);
      }}
      className="w-full rounded border px-3 py-2"
    >
      <option value="asc">
        Ascending
      </option>

      <option value="desc">
        Descending
      </option>
    </select>
  </div>

</div>
        </div>
        

        {/* Loading */}
        {loading && (
          <div className="rounded-lg border border-gray-300 bg-white p-8 text-center shadow">
            Loading products...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-lg border border-gray-300 bg-white p-8 text-center shadow">
            <p className="mb-4 text-red-600">
              {error}
            </p>

            <button
              onClick={fetchProducts}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="rounded-lg border border-gray-300 bg-white p-8 text-center shadow">
              No products found.
            </div>
          )}

        {/* Desktop Table */}
        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="hidden overflow-x-auto rounded-lg border border-gray-300 bg-white shadow md:block">
              <table className="w-full text-left">
                <thead className="border-b border-gray-300 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">
                      Image
                    </th>

                    <th className="px-4 py-3">
                      Title
                    </th>

                    <th className="px-4 py-3">
                      Category
                    </th>

                    <th className="px-4 py-3">
                      Price
                    </th>

                    <th className="px-4 py-3">
                      Rating
                    </th>

                    <th className="px-4 py-3">
                      Stock
                    </th>
                    <th className="px-4 py-3">
  Actions
</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-200"
                    >
                      <td className="px-4 py-3">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="h-12 w-12 rounded object-cover"
                        />
                      </td>

                    <td className="px-4 py-3">
  <Link
    href={`/products/${product.id}`}
    className="font-medium text-blue-600 hover:underline"
  >
    {product.title}
  </Link>
</td>

                      <td className="px-4 py-3 capitalize">
                        {product.category}
                      </td>

                      <td className="px-4 py-3">
                        ${product.price}
                      </td>

                      <td className="px-4 py-3">
                        ⭐ {product.rating}
                      </td>

                      <td className="px-4 py-3">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3">
  <div className="flex gap-2">
    <button
      onClick={() =>
        router.push(`/products/${product.id}/edit`)
      }
      className="rounded bg-black px-3 py-1 text-sm text-white"
    >
      Edit
    </button>

    <button
      onClick={() => handleDelete(product.id)}
      className="rounded bg-red-600 px-3 py-1 text-sm text-white"
    >
      Delete
    </button>
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {/* Mobile Cards */}
        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="space-y-4 md:hidden">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg border border-gray-300 bg-white p-4 shadow"
                >
                  <div className="flex gap-4">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-20 w-20 rounded object-cover"
                    />

                    <div className="flex-1">
                      <Link
  href={`/products/${product.id}`}
  className="font-semibold text-blue-600 hover:underline"
>
  {product.title}
</Link>

                      <p className="mt-1 text-sm capitalize">
                        {product.category}
                      </p>

                      <p className="mt-2 font-medium">
                        ${product.price}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between border-t border-gray-300 pt-3 text-sm">
                    <span>
                      ⭐ {product.rating}
                    </span>

                    <span>
                      Stock: {product.stock}
                    </span>
                  </div>
                   <div className="mt-3 flex gap-2">
  <button
    onClick={() =>
      router.push(`/products/${product.id}/edit`)
    }
    className="flex-1 rounded bg-black px-3 py-2 text-sm text-white"
  >
    Edit
  </button>

  <button
    onClick={() => handleDelete(product.id)}
    className="flex-1 rounded bg-red-600 px-3 py-2 text-sm text-white"
  >
    Delete
  </button>
</div>
                </div>
              ))}
            </div>
          )}

       
        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="mt-6 rounded-lg bg-white p-4 shadow">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  {(page - 1) * pageSize + 1}
                  {"–"}
                  {Math.min(
                    page * pageSize,
                    total
                  )}{" "}
                  of {total}
                </p>

                
                <div className="flex items-center gap-2">
                  <label className="text-sm">
                    Page size:
                  </label>

                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newPageSize =
                        Number(e.target.value);

                      updatePagination(
                        1,
                        newPageSize
                      );
                    }}
                    className="rounded border px-2 py-1"
                  >
                    <option value={10}>
                      10
                    </option>

                    <option value={20}>
                      20
                    </option>

                    <option value={50}>
                      50
                    </option>
                  </select>
                </div>

                
                <div className="flex items-center gap-2">

                  
                  <button
                    disabled={page === 1}
                    onClick={() =>
                      updatePagination(page - 1)
                    }
                    className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() =>
                        updatePagination(
                          pageNumber
                        )
                      }
                      className={`rounded border px-3 py-1 ${
                        pageNumber === page
                          ? "bg-black text-white"
                          : ""
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                 
                  <button
                    disabled={
                      page === totalPages
                    }
                    onClick={() =>
                      updatePagination(
                        page + 1
                      )
                    }
                    className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>

                </div>
              </div>
            </div>
          )}
      </main>
    </ProtectedRoute>
  );
}