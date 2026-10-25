import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import {
  BsCheckCircleFill,
  BsExclamationTriangle,
  BsReceipt,
} from "react-icons/bs";
import { useMe } from "../../hooks/useAuth";
import { useOrder } from "../../hooks/useOrders";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Container from "../../components/ui/Container";
import EmptyState from "../../components/ui/EmptyState";
import Price from "../../components/ui/Price";
import Skeleton from "../../components/ui/Skeleton";
import OrderTotals from "../../components/OrderTotals";
import PageMeta from "../../components/PageMeta";
import { orderNumber } from "../../utils/orders";

export default function OrderConfirmation() {
  const router = useRouter();
  const orderId =
    typeof router.query.orderId === "string" ? router.query.orderId : undefined;
  const { user, isLoading } = useMe();
  const { data: order, error, refetch, isRefetching } = useOrder(orderId);
  const notFound = axios.isAxiosError(error) && error.response?.status === 404;

  useEffect(() => {
    if (!isLoading && !user) router.push("/signin");
  }, [isLoading, user, router]);

  if (error && !order) {
    return (
      <Container size="md" className="py-6">
        <PageMeta title="Order" />
        <Card>
          {notFound ? (
            <EmptyState
              icon={BsReceipt}
              title="Order not found"
              description="It may belong to another account, or the link is wrong."
            >
              <Button onClick={() => router.push("/")}>Back to the shop</Button>
            </EmptyState>
          ) : (
            <EmptyState
              icon={BsExclamationTriangle}
              title="We couldn't load this order"
              description="Check your connection and try again."
            >
              <Button loading={isRefetching} onClick={() => refetch()}>
                Try again
              </Button>
            </EmptyState>
          )}
        </Card>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container size="md" className="py-6" aria-busy="true">
        <span className="sr-only">Loading your order</span>
        <Skeleton className="h-24" />
        <Skeleton className="mt-6 h-64" />
      </Container>
    );
  }

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const { address } = order;

  return (
    <Container size="md" className="py-6">
      <PageMeta title="Order confirmation" />
      <div className="flex items-start gap-4">
        <BsCheckCircleFill
          aria-hidden
          className="mt-1 shrink-0 text-3xl text-success"
        />
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Thanks for your order
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Order {orderNumber(order.id)} · placed on{" "}
            {order.createdAt_formatted}
          </p>
          <p className="mt-3 text-sm">
            This is a demo shop, so nothing will be charged or shipped.
          </p>
        </div>
      </div>

      <Card className="mt-6 px-4 md:px-6">
        <h2 className="pt-5 text-lg font-semibold">Items</h2>
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-4 py-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                <Image
                  src={item.picUrl}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                  alt=""
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${item.productId}`}
                  className="line-clamp-2 font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  Qty {item.quantity}
                  {item.quantity > 1 && (
                    <>
                      {" · "}
                      <Price amount={item.price} /> each
                    </>
                  )}
                </p>
              </div>
              <Price
                amount={item.price * item.quantity}
                className="shrink-0 font-bold"
              />
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-semibold">Delivery address</h2>
          <address className="mt-3 text-sm not-italic">
            {address.name}
            <br />
            {address.address}
            <br />
            {address.city}
            <br />
            {address.postcode}
          </address>
        </Card>
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <OrderTotals itemCount={itemCount} total={order.total} />
        </Card>
      </div>

      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 font-medium text-primary-foreground shadow-sm hover:bg-primary-hover"
      >
        Continue shopping
      </Link>
    </Container>
  );
}
