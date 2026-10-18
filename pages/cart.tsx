import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
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

export default function Cart() {
  const { user, isLoading } = useMe();
  const { data: cart } = useCart();
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
    <Container size="md" className="py-5">
      <Card className="flex flex-col p-4 md:px-10">
        <h2 className="text-xl font-bold text-foreground">Shopping Basket</h2>
        <div>
          {cart ? (
            cart.length > 0 ? (
              <div>
                {cart.map((productCart) => {
                  return (
                    <div
                      key={productCart.product._id}
                      className="my-5 flex min-h-25 justify-between border-b border-border py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex w-25 items-center justify-center rounded-md bg-white p-1">
                          <Image
                            src={productCart.product.picUrl}
                            width={50}
                            height={70}
                            className="h-17.5 w-auto min-w-12.5 object-contain"
                            alt={productCart.product.name}
                          />
                        </div>
                        <div className="flex flex-col gap-5">
                          <Link href={`/product/${productCart.product._id}`}>
                            <h3 className="text-sm font-semibold">
                              {productCart.product.name}
                            </h3>
                          </Link>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-3 rounded-2xl border border-border px-2 text-sm">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      productCart.product._id,
                                      productCart.quantity,
                                      "-1",
                                    )
                                  }
                                  disabled={disableButton}
                                  aria-label="Decrease quantity"
                                >
                                  -
                                </button>
                                <p>{productCart.quantity}</p>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      productCart.product._id,
                                      productCart.quantity,
                                      "+1",
                                    )
                                  }
                                  disabled={disableButton}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() =>
                                  removeProduct(productCart.product._id)
                                }
                                disabled={disableButton}
                                className="text-sm text-link"
                              >
                                Remove
                              </button>
                            </div>
                            {limitReachedId === productCart.product._id && (
                              <p className="text-xs text-danger">
                                The limit is {MAX_CART_QUANTITY}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Price
                        amount={productCart.product.price}
                        className="text-sm font-bold"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-3">
                <p>Basket is empty</p>
                <Button className="mt-1" onClick={() => router.push("/")}>
                  Go to shopping!
                </Button>
              </div>
            )
          ) : (
            <Skeleton height={100} count={3} />
          )}
        </div>
        <div className="flex items-center gap-1 self-end">
          <p className="text-sm">{`Subtotal (${cartQuantity} items):`}</p>
          <Price amount={totalPrice} className="font-bold" />
        </div>
      </Card>
    </Container>
  );
}
