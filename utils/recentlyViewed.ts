import type { ProductWithRating } from "@/types";

const RECENT_KEY = "recentlyViewed";
export const MAX_RECENT = 4;
const EMPTY: ProductWithRating[] = [];

const listeners = new Set<() => void>();
// cached, useSyncExternalStore needs the same array until something changes
let current: ProductWithRating[] | null = null;

// storage can hold anything, keep only entries shaped like a product
const isEntry = (value: unknown): value is ProductWithRating =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as ProductWithRating).product?._id === "string" &&
  typeof (value as ProductWithRating).reviewAverage === "number";

function readStored(): ProductWithRating[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(RECENT_KEY) ?? "[]",
    );
    return Array.isArray(stored) ? stored.filter(isEntry) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function save(entries: ProductWithRating[]) {
  current = entries;
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(entries));
  } catch {
    // private mode can block storage, the list still lasts for this visit
  }
  listeners.forEach((listener) => listener());
}

// another tab viewing a product updates this one too
const onStorage = (e: StorageEvent) => {
  if (e.key !== RECENT_KEY) return;
  current = readStored();
  listeners.forEach((listener) => listener());
};

export function subscribeRecentlyViewed(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const getRecentlyViewed = () => (current ??= readStored());
export const getServerRecentlyViewed = () => EMPTY;

// newest first, viewing a product again moves it to the front
export function addRecentlyViewed(entry: ProductWithRating) {
  const others = getRecentlyViewed().filter(
    ({ product }) => product._id !== entry.product._id,
  );
  save([entry, ...others].slice(0, MAX_RECENT));
}

export const clearRecentlyViewed = () => save(EMPTY);
