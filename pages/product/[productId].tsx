import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BsCheckCircleFill } from "react-icons/bs";
import { getProductById, getRelatedProducts } from "../../lib/products";
import { getReviewSummary } from "../../lib/reviews";
import ImageGallery from "../../components/ImageGallery";
import ProductGrid from "../../components/ProductGrid";
import Reviews from "../../components/Reviews";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Container from "../../components/ui/Container";
import Price from "../../components/ui/Price";
import QuantityStepper from "../../components/ui/QuantityStepper";
import Stars from "../../components/ui/Stars";
import { useMe } from "../../hooks/useAuth";
import { useAddToCart } from "../../hooks/useCart";
import { MAX_CART_QUANTITY } from "../../utils/constants";
import { catalogs } from "../../utils/catalogs";
import { toast } from "../../utils/toast";
import type { GetServerSideProps } from "next";
import type {
  Product as ProductType,
  ProductWithRating,
  Review,
  ReviewSummary,
} from "@/types";

interface ProductProps {
  product: ProductType;
  reviews: Review[];
  ratingArray: ReviewSummary["ratingArray"];
  ratingAverage: number;
  related: ProductWithRating[];
}

export default function Product({
  product,
  reviews,
  ratingArray,
  ratingAverage,
  related,
}: ProductProps) {
  const [askLogin, setAskLogin] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { user } = useMe();
  const addToCartMutation = useAddToCart();
  const category = catalogs.find(
    (catalog) => catalog.id === product.categoryId,
  );
  const descriptions = [
    product.description,
    product.description2,
    product.description3,
  ].filter(Boolean);
  const reviewCount = reviews.length;

  const addToCart = () => {
    if (!user) {
      setAskLogin(true);
      return;
    }
    addToCartMutation.mutate(
      { productId: product._id, quantity },
      {
        onSuccess: () => {
          setQuantity(1);
          toast("Added to your basket");
        },
      },
    );
  };

  return (
    <Container className="py-6">
      {category && (
        // no prefetch, chrome can stall a repeat of a prefetch aborted by navigation
        <nav aria-label="Breadcrumb" className="mb-4 text-sm">
          <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
            <li>
              <Link
                href={category.link}
                prefetch={false}
                className="hover:text-foreground"
              >
                {category.name}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`${category.link}/${product.subcategory}`}
                prefetch={false}
                className="hover:text-foreground"
              >
                {product.subcategory}
              </Link>
            </li>
          </ol>
        </nav>
      )}
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <ImageGallery product={product} />
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.categoryName === "Books" ? "Author" : "Manufacturer"}:{" "}
              <span className="text-foreground">{product.manufacturer}</span>
            </p>
          </div>
          <a href="#reviews" className="flex items-center gap-2 text-sm">
            <Stars rating={reviewCount > 0 ? ratingAverage : undefined} />
            <span className="text-link hover:underline">
              {reviewCount > 0
                ? `${ratingAverage.toFixed(1)} · ${reviewCount} review${reviewCount !== 1 ? "s" : ""}`
                : "No reviews yet"}
            </span>
          </a>
          <Price amount={product.price} className="text-3xl font-bold" />
          <Card className="flex flex-col gap-4 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-success">
              <BsCheckCircleFill aria-hidden /> In stock
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <QuantityStepper
                value={quantity}
                onDecrease={() => setQuantity(quantity - 1)}
                onIncrease={() => setQuantity(quantity + 1)}
                decreaseDisabled={quantity === 1}
                increaseDisabled={quantity === MAX_CART_QUANTITY}
              />
              <Button
                size="lg"
                onClick={addToCart}
                loading={addToCartMutation.isPending}
                className="flex-1"
              >
                Add to Cart
              </Button>
            </div>
          </Card>
          {descriptions.length > 0 && (
            <div>
              <h2 className="font-semibold">About this item</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {descriptions.map((description) => (
                  <li key={description}>{description}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <Reviews
        reviews={reviews}
        ratingArray={ratingArray}
        ratingAverage={ratingAverage}
        product={product}
        setAskLogin={setAskLogin}
      />
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-12">
          <h2 id="related-heading" className="text-2xl font-bold">
            More like this
          </h2>
          <ProductGrid
            products={related}
            eagerCount={0}
            className="mt-6 lg:grid-cols-4"
          />
        </section>
      )}
      <ConfirmDialog
        open={askLogin}
        title="Sign in to continue"
        description="You need an account to add items to your cart or write a review."
        confirmLabel="Sign in"
        cancelLabel="Not now"
        confirmVariant="primary"
        onConfirm={() => router.push("/signin")}
        onCancel={() => setAskLogin(false)}
      />
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps<ProductProps> = async (
  context,
) => {
  const productId = String(context.params?.productId);
  const product = await getProductById(productId);
  if (!product) {
    return { notFound: true };
  }
  const [summary, related] = await Promise.all([
    getReviewSummary(productId),
    getRelatedProducts(product),
  ]);

  // round-trip through json so mongoose documents become plain props
  return {
    props: JSON.parse(
      JSON.stringify({
        product,
        reviews: summary.reviews,
        ratingArray: summary.ratingArray,
        ratingAverage: summary.average,
        related,
      }),
    ),
  };
};
