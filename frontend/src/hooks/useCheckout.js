import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api";

export default function useCheckout() {
  const queryClient = useQueryClient();
  const cartCode = localStorage.getItem("cart_code");

  // Fetch cart
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart", cartCode],
    queryFn: async () => {
      if (!cartCode) return { items: [] };
      const { data } = await API.get(`/cart-items/?cart_code=${cartCode}`);
      return { items: data.data };
    },
    enabled: !!cartCode,
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("access");
      const { data } = await API.post(
        "/checkout/",
        { cart_code: cartCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      // Clear cart code after checkout
      localStorage.removeItem("cart_code");
      // Invalidate cart query to refresh UI
      queryClient.invalidateQueries({ queryKey: ["cart", cartCode] });
    },
  });

  return { cart, isLoading, checkoutMutation };
}
