import ProductGrid from "./ProductGrid";
import Card from "./ui/Card";
import Skeleton from "./ui/Skeleton";
import { useWishlist } from "../hooks/useWishlist";

export default function SavedItems() {
  const { data: products, isError } = useWishlist();

  return (
    <Card className="mt-6 p-5 md:p-6">
      <section aria-labelledby="saved-heading">
        <h2 id="saved-heading" className="text-lg font-semibold">
          Saved items
        </h2>
        {isError ? (
          <p className="mt-4 text-sm text-danger">
            We couldn&apos;t load your saved items.
          </p>
        ) : !products ? (
          <div
            aria-busy="true"
            className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            <span className="sr-only">Loading your saved items</span>
            <Skeleton className="aspect-square" />
            <Skeleton className="aspect-square" />
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} eagerCount={0} className="mt-4" />
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Nothing saved yet. Tap the heart on any product to keep it here.
          </p>
        )}
      </section>
    </Card>
  );
}
