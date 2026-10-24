import Link from "next/link";
import Image from "next/image";
import Card from "./ui/Card";
import Stars from "./ui/Stars";
import Price from "./ui/Price";
import WishlistButton from "./WishlistButton";
import { cn } from "../utils/cn";
import { isCover } from "../utils/product";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  reviewAverage?: number;
  // cards in the first row are on screen at load, so skip lazy loading
  eager?: boolean;
}

export default function ProductCard({
  product,
  reviewAverage,
  eager = false,
}: ProductCardProps) {
  const cover = isCover(product);

  return (
    // the heart sits beside the link, a button inside a link is invalid html
    <div className="relative h-full">
      <Link href={`/product/${product._id}`} className="group block h-full">
        <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-200 group-hover:shadow-lg">
          {/* product photos have white backgrounds, covers sit on a neutral tile */}
          <div
            className={cn(
              "relative aspect-square",
              cover ? "bg-muted" : "bg-white",
            )}
          >
            <Image
              src={product.picUrl}
              alt=""
              fill
              sizes="(min-width: 1280px) 300px, (min-width: 640px) 33vw, 50vw"
              loading={eager ? "eager" : "lazy"}
              className={cover ? "object-contain p-3" : "object-cover"}
            />
          </div>
          <div className="flex flex-1 flex-col gap-2 p-3">
            <h2 className="line-clamp-2 text-sm font-medium group-hover:underline md:text-base">
              {product.name}
            </h2>
            {/* ratings are 1 to 5, so an average of 0 means no reviews yet */}
            <Stars rating={reviewAverage || undefined} size="sm" />
            <Price amount={product.price} className="mt-auto font-bold" />
          </div>
        </Card>
      </Link>
      <WishlistButton
        productId={product._id}
        productName={product.name}
        className="absolute top-2 right-2 h-9 w-9 shadow-sm"
      />
    </div>
  );
}
