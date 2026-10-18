import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";

const sizes = {
  sm: "max-w-md",
  md: "max-w-3xl",
  lg: "max-w-7xl",
};

interface ContainerProps extends ComponentProps<"div"> {
  size?: keyof typeof sizes;
}

// the same width and side gutters on every page
export default function Container({
  size = "lg",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 md:px-6", sizes[size], className)}
      {...props}
    />
  );
}
