import { useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../api";
import useProductDetail from "../hooks/useProductDetail";

export default function ProductDetailPage({ setNumCartItems }) {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const { product, isLoading, inCart, addToCartMutation } = useProductDetail(id, setNumCartItems);

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (!product) return <p className="text-center">Product not found</p>;

  const discountedPrice =
    product.discount && product.discount > 0
      ? (product.price - (product.price * product.discount) / 100).toFixed(2)
      : null;

  const alreadyInCart = inCart;

  const handleAddToCart = async () => {
    try {
      await addToCartMutation.mutateAsync({ quantity });
      setMessage("✅ Added to cart!");
    } catch (err) {
      setMessage(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6 bg-white shadow rounded-xl p-6">
        {/* Image */}
        <div className="flex justify-center">
          <img
            src={`${API_URL}${product.image}`}
            alt={product.name}
            className="h-80 object-contain rounded"
          />
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>

          {discountedPrice ? (
            <p className="text-xl font-semibold text-green-600 mb-2">
              ₹{discountedPrice}{" "}
              <span className="line-through text-gray-500 ml-2">₹{product.price}</span>{" "}
              <span className="text-red-500 ml-1">({product.discount}% off)</span>
            </p>
          ) : (
            <p className="text-xl font-semibold text-green-600 mb-2">₹{product.price}</p>
          )}

          <p className="text-sm text-gray-600 mb-4">In stock: {product.inventory}</p>

          <div className="flex items-center gap-2 mb-4">
            <label className="text-sm text-gray-700">Quantity:</label>
            <input
              type="number"
              min="1"
              max={product.inventory}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-16 border rounded px-2 py-1 text-center"
              disabled={alreadyInCart}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={quantity < 1 || quantity > product.inventory || alreadyInCart || addToCartMutation.isLoading}
              className={`px-4 py-2 rounded-lg ${
                alreadyInCart
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {alreadyInCart
                ? "Already in Cart"
                : addToCartMutation.isLoading
                ? "Adding..."
                : "Add to Cart"}
            </button>
          </div>

          {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
        </div>
      </div>
    </div>
  );
}
