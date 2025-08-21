import useMyOrders from "../hooks/useMyOrders";
import { API_URL } from "../api";

export default function MyOrdersPage() {
  const { data: orders, isLoading, isError } = useMyOrders();

  if (isLoading) return <p className="text-center py-8">Loading orders...</p>;
  if (isError) return <p className="text-center py-8 text-red-500">Failed to load orders.</p>;
  if (!orders || orders.length === 0)
    return <p className="text-center py-8">You have no orders yet.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">My Orders</h1>

      {orders.map((order) => (
        <div
          key={order.id}
          className="border rounded-lg p-4 mb-6 shadow-md bg-white"
        >
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h2 className="font-semibold mb-1">Order Code: {order.cart_code}</h2>
              <p className="text-sm text-gray-600">
                Placed on: {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <span className="font-semibold text-lg">
                Total: ₹{parseFloat(order.total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t pt-4 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 border-b pb-4 last:border-b-0"
              >
                {/* Product Image */}
                <img
                  src={`${API_URL}${item.product.image}`}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">{item.product.description}</p>
                  <p className="text-sm mt-1">
                    Quantity: <span className="font-medium">{item.quantity}</span>
                  </p>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="font-medium">
                    ₹
                    {(
                      parseFloat(item.product.price) *
                      item.quantity *
                      (1 - parseFloat(item.product.discount) / 100)
                    ).toFixed(2)}
                  </p>
                  {parseFloat(item.product.discount) > 0 && (
                    <p className="text-xs text-gray-500 line-through">
                      ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
