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

const TOGGLE_KEY = ["wishlist", "toggle"];

// the heart reads user.wishlist, so that is updated first and refetched once saves finish
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: TOGGLE_KEY,
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
      queryClient.setQueryData<User>(
        ME_KEY,
        (user) =>
          user && {
            ...user,
            wishlist: saved
              ? user.wishlist.filter((id) => id !== productId)
              : [productId, ...user.wishlist],
          },
      );
    },
    onError: (error) => toast(errorMessage(error), "error"),
    // replies can arrive out of order, so only the last save to finish refetches the truth
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEY });
      // this mutation may still count as running here
      if (queryClient.isMutating({ mutationKey: TOGGLE_KEY }) <= 1) {
        queryClient.invalidateQueries({ queryKey: ME_KEY });
      }
    },
  });
}

interface Toggle {
  productId: string;
  // whether it is saved now, so the click removes it
  saved: boolean;
}
