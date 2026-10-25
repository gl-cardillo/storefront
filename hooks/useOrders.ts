import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ME_KEY } from "./useAuth";
import { CART_KEY } from "./useCart";
import type { CheckoutInput } from "../utils/schemas";
import type { Order } from "@/types";

// the server empties the basket, so the cached cart and badge follow
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (address: CheckoutInput) =>
      (await axios.post<{ order: Order }>("/api/orders", address)).data.order,
    onSuccess: () => {
      queryClient.setQueryData(CART_KEY, []);
      queryClient.invalidateQueries({ queryKey: ME_KEY });
    },
  });
}
