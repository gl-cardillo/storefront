import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BsCart2, BsExclamationTriangle, BsInfoCircle } from "react-icons/bs";
import { errorMessage, useMe } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { usePlaceOrder } from "../hooks/useOrders";
import { checkoutSchema, type CheckoutInput } from "../utils/schemas";
import { toast } from "../utils/toast";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import EmptyState from "../components/ui/EmptyState";
import Price from "../components/ui/Price";
import Skeleton from "../components/ui/Skeleton";
import { FieldError, Input, Label } from "../components/ui/Field";
import OrderTotals from "../components/OrderTotals";
import PageMeta from "../components/PageMeta";

const ADDRESS_FIELDS: {
  name: keyof CheckoutInput;
  label: string;
  autoComplete: string;
  // city and postcode share a row on wider screens
  half?: boolean;
}[] = [
  { name: "name", label: "Full name", autoComplete: "name" },
  { name: "address", label: "Address", autoComplete: "street-address" },
  { name: "city", label: "City", autoComplete: "address-level2", half: true },
  {
    name: "postcode",
    label: "Postcode",
    autoComplete: "postal-code",
    half: true,
  },
];

export default function Checkout() {
  const router = useRouter();
  const { user, isLoading } = useMe();
  const { data: cart, isError, refetch, isRefetching } = useCart();
  const placeOrder = usePlaceOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema) });

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/signin");
      return;
    }
    // start from the profile address, the order keeps its own copy
    reset({
      name: user.name ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
      postcode: user.postcode ?? "",
    });
  }, [isLoading, user, reset, router]);

  const submit = (address: CheckoutInput) => {
    placeOrder.mutate(address, {
      onSuccess: async () => {
        await router.replace("/");
        toast("Order placed");
      },
      onError: (error) => toast(errorMessage(error), "error"),
    });
  };

  const itemCount = (cart ?? []).reduce((sum, i) => sum + i.quantity, 0);
  const total = (cart ?? []).reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  // the basket is already empty while the page navigates away
  if (placeOrder.isSuccess) {
    return (
      <Container size="sm" className="py-20 text-center" aria-busy="true">
        <p className="text-lg font-semibold">Order placed</p>
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <PageMeta title="Checkout" />
      <h1 className="text-2xl font-bold md:text-3xl">Checkout</h1>
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
            description="Add something to your basket before checking out."
          >
            <Button onClick={() => router.push("/")}>Start shopping</Button>
          </EmptyState>
        </Card>
      ) : (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="flex flex-col gap-6">
            <Card className="p-5 md:p-6">
              <h2 className="text-lg font-semibold">Delivery address</h2>
              <form
                id="checkout-form"
                aria-label="Delivery address"
                noValidate
                onSubmit={handleSubmit(submit)}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                {ADDRESS_FIELDS.map(({ name, label, autoComplete, half }) => (
                  <div
                    key={name}
                    className={
                      half
                        ? "flex flex-col gap-1"
                        : "flex flex-col gap-1 sm:col-span-2"
                    }
                  >
                    <Label htmlFor={name}>{label}</Label>
                    <Input
                      id={name}
                      autoComplete={autoComplete}
                      aria-invalid={Boolean(errors[name])}
                      {...register(name)}
                    />
                    <FieldError message={errors[name]?.message} />
                  </div>
                ))}
              </form>
            </Card>
            <Card className="flex gap-3 p-5 text-sm md:p-6">
              <BsInfoCircle
                aria-hidden
                className="mt-0.5 shrink-0 text-lg text-link"
              />
              <div>
                <h2 className="font-semibold">Payment</h2>
                <p className="mt-1 text-muted-foreground">
                  This is a demo shop. No payment is taken and nothing is
                  shipped, so there are no card details to enter.
                </p>
              </div>
            </Card>
          </div>

          <Card className="flex flex-col gap-3 p-5 lg:sticky lg:top-22">
            <h2 className="text-lg font-semibold">Order summary</h2>
            {cart ? (
              <>
                <ul className="flex flex-col gap-2 border-b border-border pb-3 text-sm">
                  {cart.map(({ product, quantity }) => (
                    <li
                      key={product._id}
                      className="flex justify-between gap-3"
                    >
                      <span className="min-w-0">
                        <span className="text-muted-foreground">
                          {quantity} ×{" "}
                        </span>
                        <Link
                          href={`/product/${product._id}`}
                          className="hover:underline"
                        >
                          {product.name}
                        </Link>
                      </span>
                      <Price
                        amount={product.price * quantity}
                        className="shrink-0"
                      />
                    </li>
                  ))}
                </ul>
                <OrderTotals itemCount={itemCount} total={total} />
              </>
            ) : (
              <div aria-busy="true">
                <span className="sr-only">Loading your basket</span>
                <Skeleton className="h-36" />
              </div>
            )}
            <Button
              type="submit"
              form="checkout-form"
              size="lg"
              loading={placeOrder.isPending}
              disabled={!cart}
              className="mt-2 w-full"
            >
              Place order
            </Button>
            <Link
              href="/cart"
              className="text-center text-sm text-link hover:underline"
            >
              Back to basket
            </Link>
          </Card>
        </div>
      )}
    </Container>
  );
}
