import { INTL_LOCALE, type Locale } from "./i18n/index.ts";
import type { Currency } from "./schools.ts";

/** 2500, "GBP" → "£2,500" (en) or "2 500 £" (az). */
export function formatPrice(price: number, currency: Currency, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

/** Today's date in Baku (UTC+4) as YYYY-MM-DD, for comparing with paid_until. */
export function bakuToday(now = new Date()): string {
  return new Date(now.getTime() + 4 * 3600_000).toISOString().slice(0, 10);
}
