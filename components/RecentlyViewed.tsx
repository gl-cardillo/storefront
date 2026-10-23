import ProductGrid from "./ProductGrid";
import Button from "./ui/Button";
import Container from "./ui/Container";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { clearRecentlyViewed } from "../utils/recentlyViewed";

// saved in this browser only, so it works without an account
export default function RecentlyViewed() {
  const recent = useRecentlyViewed();
  if (recent.length === 0) return null;

  return (
    <Container className="pb-10">
      <section aria-labelledby="recent-heading">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recent-heading" className="text-2xl font-bold">
            Recently viewed
          </h2>
          <Button
            variant="secondary"
            size="sm"
            aria-label="Clear recently viewed"
            onClick={clearRecentlyViewed}
          >
            Clear
          </Button>
        </div>
        <ProductGrid
          products={recent}
          eagerCount={0}
          className="mt-6 lg:grid-cols-4"
        />
      </section>
    </Container>
  );
}
