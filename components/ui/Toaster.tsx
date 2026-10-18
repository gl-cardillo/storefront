import { useSyncExternalStore } from "react";
import {
  BsCheckCircleFill,
  BsExclamationCircleFill,
  BsXLg,
} from "react-icons/bs";
import {
  dismissToast,
  getServerToasts,
  getToasts,
  subscribeToasts,
} from "../../utils/toast";

// the live region is always mounted, so screen readers announce new toasts
export default function Toaster() {
  const toasts = useSyncExternalStore(
    subscribeToasts,
    getToasts,
    getServerToasts,
  );

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed top-30 right-4 z-30 flex flex-col items-end gap-2 md:top-20"
    >
      {toasts.map(({ id, message, variant }) => (
        <div
          key={id}
          className="pointer-events-auto flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm shadow-lg"
        >
          {variant === "success" ? (
            <BsCheckCircleFill aria-hidden className="text-success" />
          ) : (
            <BsExclamationCircleFill aria-hidden className="text-danger" />
          )}
          <p>{message}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismissToast(id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <BsXLg />
          </button>
        </div>
      ))}
    </div>
  );
}
