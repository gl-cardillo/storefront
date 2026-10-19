import Link from "next/link";
import Image from "next/image";
import Card from "./ui/Card";
import Stars from "./ui/Stars";
import Price from "./ui/Price";
import { cn } from "../utils/cn";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  reviewAverage?: number;
}

export default function ProductCard({
  product,
  reviewAverage,
}: ProductCardProps) {
  // book and game covers are portrait, show them whole instead of cropping
  const isCover =
    product.categoryId === "books" || product.subcategory === "Videogame";

  return (
    <Link href={`/product/${product._id}`} className="group">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-200 group-hover:shadow-lg">
        {/* product photos have white backgrounds, covers sit on a neutral tile */}
        <div
          className={cn(
            "relative aspect-square",
            isCover ? "bg-muted" : "bg-white",
          )}
        >
          <Image
            src={product.picUrl}
            alt=""
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 640px) 33vw, 50vw"
            className={isCover ? "object-contain p-3" : "object-cover"}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <h3 className="line-clamp-2 text-sm font-medium group-hover:underline md:text-base">
            {product.name}
          </h3>
          {/* ratings are 1 to 5, so an average of 0 means no reviews yet */}
          <Stars rating={reviewAverage || undefined} size="sm" />
          <Price amount={product.price} className="mt-auto font-bold" />
        </div>
      </Card>
    </Link>
  );
}
