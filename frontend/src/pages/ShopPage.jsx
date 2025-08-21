import { useProducts } from "../hooks/useProducts";
import { Link, useLocation } from "react-router-dom";
import { API_URL } from "../api";

export default function ShopPage() {
  const { products, loading } = useProducts();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery)
  );

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {filteredProducts.length === 0 && <p className="col-span-full text-center">No products found.</p>}
      {filteredProducts.map((product) => (
        <Link key={product.id} to={`/products/${product.id}`} className="bg-white shadow rounded-xl p-4 flex flex-col items-center hover:shadow-lg transition">
          <img src={`${API_URL}${product.image}`} alt={product.name} className="h-40 object-contain mb-4" />
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p className="text-gray-600 text-sm">{product.description}</p>
          <p className="mt-2 font-bold">₹{product.price}</p>
        </Link>
      ))}
    </div>
  );
}
