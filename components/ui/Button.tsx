import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import Spinner from "./Spinner";

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
  secondary: "border border-border bg-surface text-foreground hover:bg-muted",
  danger: "border border-danger text-danger hover:bg-danger/10",
  destructive: "bg-danger text-danger-foreground shadow-sm hover:bg-danger/90",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6",
};

interface ButtonProps extends ComponentProps<"button"> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  // shows a spinner and blocks clicks while a request runs
  loading?: boolean;
}

// type defaults to "button", forms pass type="submit"
export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-80",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
