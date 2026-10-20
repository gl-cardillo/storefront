import { cn } from "../../utils/cn";

interface QuantityStepperProps {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
  className?: string;
}

export default function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  decreaseDisabled = false,
  increaseDisabled = false,
  className,
}: QuantityStepperProps) {
  const button =
    "flex h-9 w-9 items-center justify-center text-lg hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";
  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-md border border-border bg-surface",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={onDecrease}
        disabled={decreaseDisabled}
        className={button}
      >
        −
      </button>
      {/* announced when it changes */}
      <output aria-live="polite" className="w-8 text-center font-medium">
        {value}
      </output>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={onIncrease}
        disabled={increaseDisabled}
        className={button}
      >
        +
      </button>
    </div>
  );
}
