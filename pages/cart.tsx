import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { BsCart2, BsExclamationTriangle, BsTrash } from "react-icons/bs";
import { useMe } from "../hooks/useAuth";
import {
  useCart,
  useRemoveFromCart,
  useUpdateCartQuantity,
  type CartStep,
} from "../hooks/useCart";
import { MAX_CART_QUANTITY } from "../utils/constants";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import Price from "../components/ui/Price";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import OrderTotals from "../components/OrderTotals";
import QuantityStepper from "../components/ui/QuantityStepper";
import { cn } from "../utils/cn";
import { isCover } from "../utils/product";

export default function Cart() {
  const { user, isLoading } = useMe();
  const { data: cart, isError, refetch, isRefetching } = useCart();
  const updateCartQuantity = useUpdateCartQuantity();
  const removeFromCart = useRemoveFromCart();
  // id of the product that hit the quantity limit
  const [limitReachedId, setLimitReachedId] = useState<string | null>(null);
  const router = useRouter();
  // one change at a time, concurrent saves of the same user would conflict
  const disableButton =
    updateCartQuantity.isPending || removeFromCart.isPending;

  const cartQuantity = (cart ?? []).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalPrice = (cart ?? []).reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin");
    }
  }, [isLoading, user, router]);

  const removeProduct = (productId: string) => {
    setLimitReachedId(null);
    removeFromCart.mutate(productId);
  };

  const updateQuantity = (productId: string, quantity: number, n: CartStep) => {
    if (quantity === 1 && n === "-1") {
      removeProduct(productId);
      return;
    }
    if (quantity === MAX_CART_QUANTITY && n === "+1") {
      setLimitReachedId(productId);
      return;
    }
    setLimitReachedId(null);
    updateCartQuantity.mutate({ productId, n });
  };

  return (
    <Container className="py-6">
      <h1 className="text-2xl font-bold md:text-3xl">Shopping basket</h1>
      {isError && !cart ? (
        <Card className="mt-6">
          <EmptyState
            icon={BsExclamationTriangle}
            title="We couldn't load your basket"
            description="Check your connection and try again."
          >
            <Button loading={isRefetching} onClick={() => refetch()}>
              Try again
            </Button>
          </EmptyState>
        </Card>
      ) : cart && cart.length === 0 ? (
        <Card className="mt-6">
          <EmptyState
            icon={BsCart2}
            title="Your basket is empty"
            description="Find something you like and add it to your basket."
          >
            <Button onClick={() => router.push("/")}>Start shopping</Button>
          </EmptyState>
        </Card>
      ) : (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
          <Card className="px-4 md:px-6">
            {cart ? (
              <ul className="divide-y divide-border">
                {cart.map(({ product, quantity }) => (
                  <li key={product._id} className="flex gap-4 py-5">
                    <Link
                      href={`/product/${product._id}`}
                      className={cn(
                        "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border",
                        isCover(product) ? "bg-muted" : "bg-white",
                      )}
                    >
                      <Image
                        src={product.picUrl}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                        alt={product.name}
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${product._id}`}
                          className="line-clamp-2 font-medium hover:underline"
                        >
                          {product.name}
                        </Link>
                        {quantity > 1 && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            <Price amount={product.price} /> each
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <QuantityStepper
                            value={quantity}
                            onDecrease={() =>
                              updateQuantity(product._id, quantity, "-1")
                            }
                            onIncrease={() =>
                              updateQuantity(product._id, quantity, "+1")
                            }
                            decreaseDisabled={disableButton}
                            increaseDisabled={disableButton}
                          />
                          <button
                            type="button"
                            onClick={() => removeProduct(product._id)}
                            disabled={disableButton}
                            className="flex items-center gap-1 text-sm text-link hover:underline disabled:opacity-50"
                          >
                            <BsTrash aria-hidden /> Remove
                          </button>
                        </div>
                        {limitReachedId === product._id && (
                          <p role="alert" className="mt-2 text-xs text-danger">
                            The limit is {MAX_CART_QUANTITY}
                          </p>
                        )}
                      </div>
                      <Price
                        amount={product.price * quantity}
                        className="font-bold sm:text-right"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div aria-busy="true" className="divide-y divide-border">
                <span className="sr-only">Loading your basket</span>
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex gap-4 py-5">
                    <Skeleton className="h-20 w-20 shrink-0" />
                    <div className="flex flex-1 flex-col gap-3">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-9 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="flex flex-col gap-3 p-5 lg:sticky lg:top-22">
            <h2 className="text-lg font-semibold">Order summary</h2>
            {/* no totals until the items are in, 0 items would be misleading */}
            {cart ? (
              <OrderTotals itemCount={cartQuantity} total={totalPrice} />
            ) : (
              <Skeleton className="h-24" />
            )}
            <Link
              href="/checkout"
              className="mt-2 flex h-12 items-center justify-center rounded-md bg-primary px-6 font-medium text-primary-foreground shadow-sm hover:bg-primary-hover"
            >
              Checkout
            </Link>
            <p className="text-center text-xs text-muted-foreground">
              A demo checkout, no payment is taken.
            </p>
          </Card>
        </div>
      )}
    </Container>
  );
}
