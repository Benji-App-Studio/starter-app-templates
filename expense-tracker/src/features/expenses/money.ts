import type { KeypadKey } from '@/components';

/** Currencies offered in Settings. Any ISO 4217 code works with `formatMoney`. */
export const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'] as const;

export type Currency = (typeof currencies)[number];

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(currency: string, fractionDigits: number): Intl.NumberFormat {
  const key = `${currency}/${fractionDigits}`;
  let cached = formatters.get(key);
  if (!cached) {
    cached = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    formatters.set(key, cached);
  }
  return cached;
}

/** "$1,250" for whole amounts, "$12.50" otherwise. Negative cents keep their sign. */
export function formatMoney(cents: number, currency: string): string {
  const whole = cents % 100 === 0;
  return formatter(currency, whole ? 0 : 2).format(cents / 100);
}

/** The currency's symbol on this device, e.g. "$" or "€". */
export function currencySymbol(currency: string): string {
  return formatter(currency, 0).format(0).replace(/[\d\s.,]/g, '') || currency;
}

const MAX_WHOLE_DIGITS = 7;

/** Applies one keypad press to the amount being typed ("12.5" style, no symbol). */
export function applyKey(typed: string, key: KeypadKey): string {
  if (key === 'backspace') {
    return typed.slice(0, -1);
  }
  if (key === '.') {
    if (typed.includes('.')) {
      return typed;
    }
    return typed === '' ? '0.' : `${typed}.`;
  }
  const [whole, fraction] = typed.split('.');
  if (fraction !== undefined) {
    return fraction.length >= 2 ? typed : `${typed}${key}`;
  }
  if (whole === '0') {
    return key;
  }
  return whole.length >= MAX_WHOLE_DIGITS ? typed : `${typed}${key}`;
}

export function typedToCents(typed: string): number {
  return Math.round(Number(typed || '0') * 100);
}

export function centsToTyped(cents: number): string {
  if (cents === 0) {
    return '';
  }
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

/** What the amount display shows while typing: grouped whole part, the fraction as typed. */
export function formatTyped(typed: string, currency: string): string {
  const [whole, fraction] = typed.split('.');
  const grouped = Number(whole || '0').toLocaleString();
  const amount = fraction === undefined ? grouped : `${grouped}.${fraction}`;
  return `${currencySymbol(currency)}${amount}`;
}
