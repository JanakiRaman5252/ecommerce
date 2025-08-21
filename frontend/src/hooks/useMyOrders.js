import { useQuery } from "@tanstack/react-query";
import API from "../api";

export default function useMyOrders() {
  return useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const { data } = await API.get("/my-orders/");
      return data.orders;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
