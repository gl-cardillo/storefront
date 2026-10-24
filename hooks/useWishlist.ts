import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ME_KEY, errorMessage, useMe } from "./useAuth";
import { toast } from "../utils/toast";
import type { ProductWithRating, User } from "@/types";

const WISHLIST_KEY = ["wishlist"];
const WISHLIST_URL = "/api/wishlist";

export function useWishlist() {
  const { user } = useMe();
  return useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: async () =>
      (await axios.get<{ products: ProductWithRating[] }>(WISHLIST_URL)).data
        .products,
    enabled: Boolean(user),
  });
}

// the heart reads user.wishlist, so that is updated first and restored on failure
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, saved }: Toggle) =>
      (saved
        ? await axios.delete<User>(WISHLIST_URL, { data: { productId } })
        : await axios.post<User>(WISHLIST_URL, { productId })
      ).data,
    onMutate: async ({ productId, saved }: Toggle) => {
      await queryClient.cancelQueries({ queryKey: ME_KEY });
      // the saved list on the profile drops the card straight away too
      if (saved) {
        queryClient.setQueryData<ProductWithRating[]>(WISHLIST_KEY, (list) =>
          list?.filter(({ product }) => product._id !== productId),
        );
      }
      const previous = queryClient.getQueryData<User>(ME_KEY);
      if (previous) {
        queryClient.setQueryData<User>(ME_KEY, {
          ...previous,
          wishlist: saved
            ? previous.wishlist.filter((id) => id !== productId)
            : [productId, ...previous.wishlist],
        });
      }
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ME_KEY, context.previous);
      }
      toast(errorMessage(error), "error");
    },
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
    onSettled: () => queryClient.invalidateQueries({ queryKey: WISHLIST_KEY }),
  });
}

interface Toggle {
  productId: string;
  // whether it is saved now, so the click removes it
  saved: boolean;
}
