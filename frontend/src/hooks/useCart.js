import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api";

export default function useCart(setNumCartItems) {
  const queryClient = useQueryClient();
  const cartCode = localStorage.getItem("cart_code");

  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart", cartCode],
    queryFn: async () => {
      if (!cartCode) return { items: [] };
      const { data } = await API.get(`/cart-items/?cart_code=${cartCode}`);
      return { items: data.data };
    },
    enabled: !!cartCode,
    onSuccess: (data) => {
      const totalItems = data.items.reduce((sum, item) => sum + item.quantity, 0);
      setNumCartItems(totalItems);
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      await API.put("/cart-items/", { cart_item_id: itemId, quantity });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", cartCode] }),
  });

  const removeItem = useMutation({
    mutationFn: async (itemId) => {
      await API.delete("/cart-items/", { data: { cart_item_id: itemId } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", cartCode] }),
  });

  return { cart, isLoading, updateQuantity, removeItem };
}
