import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ME_KEY, errorMessage, useMe } from "./useAuth";
import { toast } from "../utils/toast";
import type { CartProduct, User } from "@/types";

export const CART_KEY = ["cart"];
const CART_URL = "/api/cart/addToCart";

export type CartStep = "+1" | "-1";

export function useCart() {
  const { user } = useMe();
  return useQuery({
    queryKey: CART_KEY,
    queryFn: async () =>
      (await axios.get<{ cart: CartProduct[] }>("/api/cart/getCartProduct"))
        .data.cart,
    enabled: Boolean(user),
  });
}

// every cart endpoint returns the updated user, which holds the cart
function useCartMutation<TVariables>(
  request: (variables: TVariables) => Promise<User>,
  optimistic?: (cart: CartProduct[], variables: TVariables) => CartProduct[],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onMutate: async (variables: TVariables) => {
      if (!optimistic) return {};
      await queryClient.cancelQueries({ queryKey: CART_KEY });
      const previous = queryClient.getQueryData<CartProduct[]>(CART_KEY);
      if (previous) {
        queryClient.setQueryData(CART_KEY, optimistic(previous, variables));
      }
      return { previous };
    },
    // undo the optimistic change and say why
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_KEY, context.previous);
      }
      toast(errorMessage(error), "error");
    },
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
    onSettled: () => queryClient.invalidateQueries({ queryKey: CART_KEY }),
  });
}

export function useAddToCart() {
  return useCartMutation(
    async (variables: { productId: string; quantity: number }) =>
      (await axios.post<User>(CART_URL, variables)).data,
  );
}

export function useUpdateCartQuantity() {
  return useCartMutation(
    async (variables: { productId: string; n: CartStep }) =>
      (await axios.put<User>(CART_URL, variables)).data,
    (cart, { productId, n }) =>
      cart.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: item.quantity + (n === "+1" ? 1 : -1) }
          : item,
      ),
  );
}

export function useRemoveFromCart() {
  return useCartMutation(
    async (productId: string) =>
      (await axios.delete<User>(CART_URL, { data: { productId } })).data,
    (cart, productId) => cart.filter((item) => item.product._id !== productId),
  );
}
