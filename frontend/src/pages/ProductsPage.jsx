import { API_URL } from "../api";
import { useProducts } from "../hooks/useProducts";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function ProductsPage() {
  const { products, loading } = useProducts();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  if (loading) return <p className="text-center py-10">Loading...</p>;

  const filteredProducts = products.filter((product) => {
    const price = product.price;
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    return price >= min && price <= max;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex  gap-4 items-center justify-start">
        <div className="flex items-center gap-2">
          <label htmlFor="minPrice" className="text-sm font-medium">Min Price:</label>
          <input
            type="number"
            id="minPrice"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="₹0"
            className="border rounded px-2 py-1 w-20 sm:w-24 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="maxPrice" className="text-sm font-medium">Max Price:</label>
          <input
            type="number"
            id="maxPrice"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="₹10000"
            className="border rounded px-2 py-1 w-20 sm:w-24 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length === 0 && (
          <p className="text-center col-span-full py-10">No products found in this price range.</p>
        )}
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="bg-white shadow rounded-xl p-4 flex flex-col items-center hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <div className="w-full h-40 sm:h-48 flex items-center justify-center mb-4">
              <img
                src={`${API_URL}${product.image}`}
                alt={product.name}
                className="max-h-full object-contain"
              />
            </div>
            <h2 className="text-lg font-semibold text-center">{product.name}</h2>
            <p className="text-gray-600 text-sm text-center line-clamp-3">{product.description}</p>
            <p className="mt-2 font-bold text-center">₹{product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
