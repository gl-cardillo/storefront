export type CurrencySymbol = "£" | "€" | "$";

// prices are stored in pounds, these convert them
export const CURRENCY_RATES: Record<CurrencySymbol, number> = {
  "£": 1,
  "€": 1.18,
  $: 1.2,
};
export const CURRENCIES = Object.keys(CURRENCY_RATES) as CurrencySymbol[];
export const DEFAULT_CURRENCY: CurrencySymbol = "£";

const CURRENCY_KEY = "currency";
const listeners = new Set<() => void>();
// kept in memory too, so the choice works even when storage is blocked
let current: CurrencySymbol | null = null;

const isCurrency = (value: unknown): value is CurrencySymbol =>
  typeof value === "string" && value in CURRENCY_RATES;

function readStored(): CurrencySymbol {
  try {
    const stored = localStorage.getItem(CURRENCY_KEY);
    return isCurrency(stored) ? stored : DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

const emit = () => listeners.forEach((listener) => listener());

// another tab changing the currency updates this one too
const onStorage = (e: StorageEvent) => {
  if (e.key !== CURRENCY_KEY) return;
  current = readStored();
  emit();
};

export function subscribeCurrency(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const getCurrency = () => (current ??= readStored());

export function setCurrency(symbol: CurrencySymbol) {
  current = symbol;
  try {
    localStorage.setItem(CURRENCY_KEY, symbol);
  } catch {
    // private mode can block storage, the choice still lasts for this visit
  }
  emit();
}
