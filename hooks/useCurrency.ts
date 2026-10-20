import { useSyncExternalStore } from "react";
import {
  CURRENCY_RATES,
  DEFAULT_CURRENCY,
  getCurrency,
  subscribeCurrency,
} from "../utils/currency";

// the server renders pounds, the saved choice applies right after hydration
export function useCurrency() {
  const symbol = useSyncExternalStore(
    subscribeCurrency,
    getCurrency,
    () => DEFAULT_CURRENCY,
  );
  return { symbol, rate: CURRENCY_RATES[symbol] };
}
