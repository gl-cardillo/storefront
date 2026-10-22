import { useRouter } from "next/router";
import { BsFunnel } from "react-icons/bs";
import ProductGrid from "./ProductGrid";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import { Label, Select } from "./ui/Field";
import { useCurrency } from "../hooks/useCurrency";
import { cn } from "../utils/cn";
import {
  MIN_RATINGS,
  PRICE_BANDS,
  SORTS,
  applyListing,
  isFiltered,
  listingQuery,
  parseListing,
  type Listing,
  type MinRating,
  type PriceBand,
  type Sort,
} from "../utils/listing";
import type { ProductWithRating } from "@/types";

interface ProductListingProps {
  products: ProductWithRating[];
  gridClassName?: string;
}

// sort and filter live in the url, so a filtered page can be shared or reloaded
export default function ProductListing({
  products,
  gridClassName,
}: ProductListingProps) {
  const router = useRouter();
  const { symbol, rate } = useCurrency();
  const listing = parseListing(router.query);
  const shown = applyListing(products, listing, rate);

  const update = (change: Partial<Listing>) => {
    // keep the page's own params (category, search text), replace the listing ones
    const query = { ...router.query };
    delete query.sort;
    delete query.price;
    delete query.minRating;
    router.replace(
      {
        pathname: router.pathname,
        query: { ...query, ...listingQuery({ ...listing, ...change }) },
      },
      undefined,
      { shallow: true, scroll: false },
    );
  };

  const priceLabel = (band: PriceBand) => {
    const { min, max } = PRICE_BANDS[band];
    if (min === 0) return `Under ${symbol}${max}`;
    if (max === Infinity) return `${symbol}${min} and over`;
    return `${symbol}${min} to ${symbol}${max}`;
  };

  const total = products.length;

  return (
    <>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {isFiltered(listing) ? `${shown.length} of ${total}` : total} product
          {total !== 1 && "s"}
        </p>
        {/* phones give sort its own row, three selects side by side would truncate */}
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-3">
          <div className="col-span-2 flex min-w-0 flex-col gap-1">
            <Label htmlFor="sort">Sort by</Label>
            <Select
              id="sort"
              value={listing.sort}
              onChange={(e) => update({ sort: e.target.value as Sort })}
              className="sm:w-44"
            >
              {Object.entries(SORTS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <Label htmlFor="price">Price</Label>
            <Select
              id="price"
              value={listing.price ?? ""}
              onChange={(e) =>
                update({ price: (e.target.value || null) as PriceBand | null })
              }
              className="sm:w-40"
            >
              <option value="">Any price</option>
              {(Object.keys(PRICE_BANDS) as PriceBand[]).map((band) => (
                <option key={band} value={band}>
                  {priceLabel(band)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <Label htmlFor="minRating">Rating</Label>
            <Select
              id="minRating"
              value={listing.minRating ?? ""}
              onChange={(e) =>
                update({
                  minRating: (Number(e.target.value) ||
                    null) as MinRating | null,
                })
              }
              className="sm:w-36"
            >
              <option value="">Any rating</option>
              {MIN_RATINGS.map((rating) => (
                <option key={rating} value={rating}>
                  {rating} stars & up
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
      {shown.length > 0 ? (
        <ProductGrid products={shown} className={cn("mt-4", gridClassName)} />
      ) : (
        <EmptyState
          icon={BsFunnel}
          title="No products match these filters"
          description="Try another price range or rating."
        >
          <Button
            variant="secondary"
            onClick={() => update({ price: null, minRating: null })}
          >
            Clear filters
          </Button>
        </EmptyState>
      )}
    </>
  );
}
