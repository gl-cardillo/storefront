import ProductCard from "./ProductCard";
import { cn } from "../utils/cn";
import type { ProductWithRating } from "@/types";

interface ProductGridProps {
  products: ProductWithRating[];
  className?: string;
  // cards loaded straight away, 0 for grids below the fold
  eagerCount?: number;
}

// two columns on phones, more as the screen grows, callers can add columns
export default function ProductGrid({
  products,
  className,
  eagerCount = 4,
}: ProductGridProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4",
        className,
      )}
    >
      {products.map(({ product, reviewAverage }, index) => (
        <li key={product._id}>
          <ProductCard
            product={product}
            reviewAverage={reviewAverage}
            eager={index < eagerCount}
          />
        </li>
      ))}
    </ul>
  );
}
