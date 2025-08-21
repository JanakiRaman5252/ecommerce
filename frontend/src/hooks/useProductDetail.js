import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api";

export default function useProductDetail(productId, setNumCartItems) {
  const queryClient = useQueryClient();
  const cartCode = localStorage.getItem("cart_code") || crypto.randomUUID();
  localStorage.setItem("cart_code", cartCode);

  // Fetch single product
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data } = await API.get(`/products/${productId}/`);
      return data;
    },
  });

  // Check if product already in cart
  const { data: inCart } = useQuery({
    queryKey: ["cart", cartCode, "product", productId],
    queryFn: async () => {
      const { data } = await API.get(
        `/cart-items/check/?cart_code=${cartCode}&product_id=${productId}`
      );
      return data.product_in_cart;
    },
    enabled: !!productId,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ quantity }) => {
      const { data } = await API.post("/cart-items/", {
        cart_code: cartCode,
        product_id: productId,
        quantity,
      });
      return data;
    },
    onSuccess: (_, { quantity }) => {
      // Update navbar cart count
      setNumCartItems((curr) => curr + quantity);
      // Invalidate cart queries
      queryClient.invalidateQueries({ queryKey: ["cart", cartCode] });
      queryClient.invalidateQueries({ queryKey: ["cart", cartCode, "product", productId] });
    },
  });

  return { product, isLoading, inCart, addToCartMutation };
}
