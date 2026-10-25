import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ME_KEY, useMe } from "./useAuth";
import { CART_KEY } from "./useCart";
import type { CheckoutInput } from "../utils/schemas";
import type { Order } from "@/types";

const orderKey = (orderId: string) => ["orders", orderId];

export function useOrder(orderId: string | undefined) {
  const { user } = useMe();
  return useQuery({
    queryKey: orderKey(orderId ?? ""),
    queryFn: async () =>
      (await axios.get<{ order: Order }>(`/api/orders/${orderId}`)).data.order,
    enabled: Boolean(user && orderId),
  });
}

// the server empties the basket, so the cached cart and badge follow
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (address: CheckoutInput) =>
      (await axios.post<{ order: Order }>("/api/orders", address)).data.order,
    onSuccess: (order) => {
      // the confirmation page shows it straight away, without a second request
      queryClient.setQueryData(orderKey(order.id), order);
      queryClient.setQueryData(CART_KEY, []);
      queryClient.invalidateQueries({ queryKey: ME_KEY });
    },
  });
}
