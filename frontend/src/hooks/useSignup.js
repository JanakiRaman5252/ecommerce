import { useMutation } from "@tanstack/react-query";
import API from "../api";

export default function useSignup() {
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await API.post("/signup/", formData);
      return data;
    },
  });
}
