import type { Plan } from '@/purchases';

/** The number inside a localized price string, or null when it cannot be read. */
export function parsePrice(price: string): number | null {
  const digits = price.replace(/[^\d.,]/g, '');
  if (!digits) {
    return null;
  }
  // "1.234,56" and "1,234.56" both end in a two-digit fraction; the last separator is the decimal point.
  const lastSeparator = Math.max(digits.lastIndexOf('.'), digits.lastIndexOf(','));
  const normalized =
    lastSeparator >= 0 && digits.length - lastSeparator - 1 <= 2
      ? `${digits.slice(0, lastSeparator).replace(/[.,]/g, '')}.${digits.slice(lastSeparator + 1)}`
      : digits.replace(/[.,]/g, '');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** The currency symbol or code around the number, e.g. "$" or "€", kept on the same side. */
function formatLike(price: string, value: number): string {
  const match = price.match(/^([^\d]*)[\d.,]+([^\d]*)$/);
  const prefix = match?.[1] ?? '';
  const suffix = match?.[2] ?? '';
  return `${prefix}${value.toFixed(2)}${suffix}`;
}

/** "$0.77" for a yearly plan, formatted like the store price. */
export function perWeek(plan: Plan): string | null {
  const value = parsePrice(plan.price);
  return value === null ? null : formatLike(plan.price, value / plan.weeks);
}

/** How much cheaper `plan` is per week than `against`, as a whole percentage. */
export function savingPercent(plan: Plan, against: Plan): number | null {
  const a = parsePrice(plan.price);
  const b = parsePrice(against.price);
  if (a === null || b === null || b === 0) {
    return null;
  }
  const saving = 1 - a / plan.weeks / (b / against.weeks);
  return saving > 0 ? Math.round(saving * 100) : null;
}
