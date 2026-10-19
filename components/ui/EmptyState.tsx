import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { cn } from "../../utils/cn";

interface EmptyStateProps {
  icon: IconType;
  title: string;
  description?: ReactNode;
  // usually a button or links to move on from here
  children?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 px-4 py-12 text-center",
        className,
      )}
    >
      <Icon aria-hidden className="mb-2 text-4xl text-muted-foreground" />
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
