import { useNavigate, Link } from "react-router-dom";
import useCart from "../hooks/useCart";
import { API_URL } from "../api";
import { useEffect } from "react";

export default function CartPage({ setNumCartItems }) {
  const navigate = useNavigate();
  const { cart, isLoading, updateQuantity, removeItem } = useCart(setNumCartItems);

  useEffect(() => {
    if (cart) {
      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setNumCartItems(totalItems);
    }
  }, [cart, setNumCartItems]);

  if (isLoading) return <p className="text-center py-8">Loading cart...</p>;

  if (!cart || cart.items.length === 0)
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <Link
          to="/"
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Go Shopping
        </Link>
      </div>
    );

  const getDiscountedPrice = (price, discount) =>
    discount > 0 ? (price - (price * discount) / 100).toFixed(2) : price;

  const total = cart.items.reduce((sum, item) => {
    const price = getDiscountedPrice(item.product.price, item.product.discount);
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">Your Cart</h1>

      <div className="grid gap-4 sm:gap-6">
        {cart.items.map((item) => {
          const discountedPrice = getDiscountedPrice(item.product.price, item.product.discount);
          const subtotal = (discountedPrice * item.quantity).toFixed(2);

          return (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center sm:justify-between border rounded-lg p-4 shadow-sm gap-4 sm:gap-6"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 w-full sm:w-2/5">
                <img
                  src={`${API_URL}${item.product.image}`}
                  alt={item.product.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm sm:text-base">{item.product.name}</h3>
                  {item.product.discount > 0 ? (
                    <p className="text-xs sm:text-sm text-gray-600">
                      ₹{discountedPrice}{" "}
                      <span className="line-through ml-1 text-gray-400">
                        ₹{item.product.price}
                      </span>{" "}
                      <span className="text-red-500 ml-1 text-xs sm:text-sm">
                        ({item.product.discount}% off)
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-600">₹{item.product.price}</p>
                  )}
                </div>
              </div>

              {/* Quantity + Subtotal */}
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-2/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity.mutate({
                        itemId: item.id,
                        quantity: Math.max(item.quantity - 1, 1),
                      })
                    }
                    className="px-2 py-1 border rounded text-sm sm:text-base"
                  >
                    -
                  </button>
                  <span className="text-sm sm:text-base">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity.mutate({
                        itemId: item.id,
                        quantity: item.quantity + 1,
                      })
                    }
                    className="px-2 py-1 border rounded text-sm sm:text-base"
                  >
                    +
                  </button>
                </div>
                <p className="font-medium text-sm sm:text-base">₹{subtotal}</p>
                <button
                  onClick={() => removeItem.mutate(item.id)}
                  className="text-red-500 hover:underline text-xs sm:text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total + Checkout */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-lg sm:text-xl font-semibold">Total: ₹{total.toFixed(2)}</h2>
        <button
          onClick={() => navigate("/checkout")}
          className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
