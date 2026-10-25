import Link from "next/link";
import { BsChevronRight } from "react-icons/bs";
import Card from "./ui/Card";
import Price from "./ui/Price";
import Skeleton from "./ui/Skeleton";
import { useOrders } from "../hooks/useOrders";
import { orderNumber } from "../utils/orders";

export default function OrderHistory() {
  const { data: orders, isError } = useOrders();

  return (
    <Card className="mt-6 p-5 md:p-6">
      <section aria-labelledby="orders-heading">
        <h2 id="orders-heading" className="text-lg font-semibold">
          Orders
        </h2>
        {isError ? (
          <p className="mt-4 text-sm text-danger">
            We couldn&apos;t load your orders.
          </p>
        ) : !orders ? (
          <div aria-busy="true" className="mt-4 flex flex-col gap-2">
            <span className="sr-only">Loading your orders</span>
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : orders.length > 0 ? (
          <ul className="mt-2 divide-y divide-border">
            {orders.map((order) => {
              const count = order.items.reduce((sum, i) => sum + i.quantity, 0);
              return (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="-mx-2 flex items-center gap-4 rounded-md px-2 py-3 hover:bg-foreground/5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        Order {orderNumber(order.id)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.createdAt_formatted} · {count} item
                        {count !== 1 && "s"}
                      </p>
                    </div>
                    <Price amount={order.total} className="font-semibold" />
                    <BsChevronRight
                      aria-hidden
                      className="shrink-0 text-muted-foreground"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No orders yet. Orders you place at checkout show up here.
          </p>
        )}
      </section>
    </Card>
  );
}
