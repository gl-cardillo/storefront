import { useState } from "react";
import Image from "next/image";
import { cn } from "../utils/cn";
import { isCover } from "../utils/product";
import type { Product } from "@/types";

export default function ImageGallery({ product }: { product: Product }) {
  const pics = [product.picUrl, product.picUrl2, product.picUrl3].filter(
    (url): url is string => Boolean(url),
  );
  const [index, setIndex] = useState(0);
  // covers sit on a neutral tile, product photos have white backgrounds
  const tile = isCover(product) ? "bg-muted" : "bg-white";

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "relative aspect-4/3 overflow-hidden rounded-lg border border-border",
          tile,
        )}
      >
        <Image
          src={pics[index]}
          fill
          sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
          className="object-contain p-4"
          alt={product.name}
          priority
        />
      </div>
      {pics.length > 1 && (
        <div className="flex gap-3">
          {pics.map((url, i) => (
            <button
              key={url}
              type="button"
              aria-label={`Show image ${i + 1} of ${pics.length}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-md border-2",
                tile,
                i === index ? "border-primary" : "border-border",
              )}
            >
              <Image
                src={url}
                fill
                sizes="64px"
                className="object-contain p-1"
                alt=""
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
