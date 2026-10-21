import { cn } from "../../utils/cn";

// a pulsing placeholder, size it with className
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-foreground/10", className)}
    />
  );
}
