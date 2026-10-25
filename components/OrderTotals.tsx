import Price from "./ui/Price";

interface OrderTotalsProps {
  itemCount: number;
  // in pounds, Price converts it
  total: number;
}

// delivery is always free in this demo, so subtotal and total match
export default function OrderTotals({ itemCount, total }: OrderTotalsProps) {
  return (
    <dl className="flex flex-col gap-2 text-sm">
      <div className="flex justify-between">
        <dt>
          Subtotal ({itemCount} item{itemCount !== 1 && "s"})
        </dt>
        <dd>
          <Price amount={total} />
        </dd>
      </div>
      <div className="flex justify-between">
        <dt>Delivery</dt>
        <dd className="text-success">Free</dd>
      </div>
      <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
        <dt>Total</dt>
        <dd>
          <Price amount={total} />
        </dd>
      </div>
    </dl>
  );
}
