import { useCurrency } from "../../hooks/useCurrency";

// prices are stored in pounds and converted to the chosen currency
export default function Price({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  const { symbol, rate } = useCurrency();
  return (
    <span className={className}>
      {symbol}
      {(Math.round(amount * rate * 100) / 100).toFixed(2)}
    </span>
  );
}
