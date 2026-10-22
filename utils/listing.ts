import type { ParsedUrlQuery } from "querystring";
import type { ProductWithRating } from "@/types";

export const SORTS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
} as const;
export type Sort = keyof typeof SORTS;

// bounds are in the shown currency, so "Under €25" matches the prices on screen
export const PRICE_BANDS = {
  "0-25": { min: 0, max: 25 },
  "25-100": { min: 25, max: 100 },
  "100-500": { min: 100, max: 500 },
  "500-": { min: 500, max: Infinity },
} as const;
export type PriceBand = keyof typeof PRICE_BANDS;

export const MIN_RATINGS = [4, 3] as const;
export type MinRating = (typeof MIN_RATINGS)[number];

export interface Listing {
  sort: Sort;
  price: PriceBand | null;
  minRating: MinRating | null;
}

const isKey = <T extends object>(object: T, key: unknown): key is keyof T =>
  typeof key === "string" && Object.hasOwn(object, key);

// unknown values fall back to the defaults, so a hand-edited url never breaks the page
export function parseListing(query: ParsedUrlQuery): Listing {
  const minRating = Number(query.minRating);
  return {
    sort: isKey(SORTS, query.sort) ? query.sort : "featured",
    price: isKey(PRICE_BANDS, query.price) ? query.price : null,
    minRating: MIN_RATINGS.find((rating) => rating === minRating) ?? null,
  };
}

// defaults are left out, so an unfiltered page keeps a clean url
export function listingQuery({ sort, price, minRating }: Listing) {
  return {
    ...(sort !== "featured" && { sort }),
    ...(price && { price }),
    ...(minRating && { minRating: String(minRating) }),
  };
}

export const isFiltered = ({ price, minRating }: Listing) =>
  Boolean(price || minRating);

type Compare = (a: ProductWithRating, b: ProductWithRating) => number;

const COMPARE: Record<Sort, Compare | null> = {
  featured: null,
  "price-asc": (a, b) => a.product.price - b.product.price,
  "price-desc": (a, b) => b.product.price - a.product.price,
  rating: (a, b) => b.reviewAverage - a.reviewAverage,
};

export function applyListing(
  products: ProductWithRating[],
  { sort, price, minRating }: Listing,
  rate: number,
) {
  const band = price && PRICE_BANDS[price];
  const shown = products.filter(
    ({ product, reviewAverage }) =>
      (!band ||
        (product.price * rate >= band.min &&
          product.price * rate < band.max)) &&
      (!minRating || reviewAverage >= minRating),
  );
  // sort is stable, so ties keep the featured order
  const compare = COMPARE[sort];
  return compare ? shown.sort(compare) : shown;
}
