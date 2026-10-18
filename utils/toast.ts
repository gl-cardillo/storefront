export type ToastVariant = "success" | "error";

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

const DURATION_MS = 4000;
const EMPTY: Toast[] = [];

let toasts: Toast[] = EMPTY;
let nextId = 1;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

// lets useSyncExternalStore render the list from anywhere in the app
export function subscribeToasts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getToasts = () => toasts;
export const getServerToasts = () => EMPTY;

export function dismissToast(id: number) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function toast(message: string, variant: ToastVariant = "success") {
  const id = nextId++;
  toasts = [...toasts, { id, message, variant }];
  emit();
  setTimeout(() => dismissToast(id), DURATION_MS);
}
