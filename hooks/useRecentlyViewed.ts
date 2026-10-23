import { useSyncExternalStore } from "react";
import {
  getRecentlyViewed,
  getServerRecentlyViewed,
  subscribeRecentlyViewed,
} from "../utils/recentlyViewed";

// the server has no history, the saved list shows right after hydration
export const useRecentlyViewed = () =>
  useSyncExternalStore(
    subscribeRecentlyViewed,
    getRecentlyViewed,
    getServerRecentlyViewed,
  );
