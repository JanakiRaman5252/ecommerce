import { useNavigate } from "react-router-dom";
import { API_URL } from "../api";
import useCheckout from "../hooks/useCheckout";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, isLoading, checkoutMutation } = useCheckout();

  if (isLoading) return <p className="text-center py-8">Loading cart...</p>;

  if (!cart || cart.items.length === 0)
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Go Shopping
        </button>
      </div>
    );

  const getDiscountedPrice = (price, discount) =>
    discount > 0 ? (price - (price * discount) / 100).toFixed(2) : price;

  const total = cart.items.reduce((sum, item) => {
    const price = getDiscountedPrice(item.product.price, item.product.discount);
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {cart.items.map((item) => {
        const discountedPrice = getDiscountedPrice(
          item.product.price,
          item.product.discount
        );
        const subtotal = (discountedPrice * item.quantity).toFixed(2);

        return (
          <div
            key={item.id}
            className="flex items-center justify-between border rounded-lg p-4 shadow-sm mb-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={`${API_URL}${item.product.image}`}
                alt={item.product.name}
                className="w-20 h-20 object-contain rounded"
              />
              <div>
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="text-sm text-gray-600">
                  ₹{discountedPrice} × {item.quantity} = ₹{subtotal}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      <div className="mt-6 text-right">
        <h2 className="text-xl font-semibold mb-4">Total: ₹{total.toFixed(2)}</h2>
        {checkoutMutation.isError && (
          <p className="text-red-500 mb-2">
            {checkoutMutation.error?.message || "Checkout failed"}
          </p>
        )}
        {checkoutMutation.isSuccess && (
          <p className="text-green-500 mb-2">
            Checkout successful! Total: ₹{checkoutMutation.data.total_amount}
          </p>
        )}
        <button
          onClick={() => checkoutMutation.mutate()}
          disabled={checkoutMutation.isLoading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {checkoutMutation.isLoading ? "Processing..." : "Confirm Checkout"}
        </button>
      </div>
    </div>
  );
}
