import type { WeightUnit } from '@/state/appState';

const LB_PER_KG = 2.2046226218;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Default increment of the weight scrubber in each unit. */
export const WEIGHT_STEP: Record<WeightUnit, number> = { kg: 2.5, lb: 5 };

export function kgToUnit(kg: number, units: WeightUnit): number {
  return units === 'kg' ? kg : kg * LB_PER_KG;
}

export function unitToKg(value: number, units: WeightUnit): number {
  return units === 'kg' ? value : value / LB_PER_KG;
}

/** "100" or "22.5" in the chosen unit, without the unit label. */
export function formatWeightValue(kg: number, units: WeightUnit): string {
  const value = kgToUnit(kg, units);
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
}

/** "100 kg" or "220 lb". */
export function formatWeight(kg: number, units: WeightUnit): string {
  return `${formatWeightValue(kg, units)} ${units}`;
}

/** Session volume: whole numbers, comma thousands ("12,480"). */
export function formatVolume(kg: number, units: WeightUnit): string {
  const value = Math.round(kgToUnit(kg, units));
  // Grouped by hand: toLocaleString came back ungrouped on device ("22135"), and a thin space all
  // but disappears in the condensed numerals, so thousands get a comma ("22,135").
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** "60 × 8" for the previous-set column and set lists. */
export function formatSet(weightKg: number | null, reps: number | null, units: WeightUnit): string {
  const weight = weightKg === null ? '–' : formatWeightValue(weightKg, units);
  const count = reps === null ? '–' : reps.toString();
  return `${weight} × ${count}`;
}

/** Epley estimate of a one-rep max. */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  return reps <= 1 ? weightKg : weightKg * (1 + reps / 30);
}

/** "48 min" or "1 h 12 min". */
export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60000));
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** "12:34" or "1:02:03" for the live workout clock and the rest timer. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const mm = hours > 0 ? minutes.toString().padStart(2, '0') : minutes.toString();
  const ss = seconds.toString().padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Monday 00:00 of the week containing `timestamp`. */
export function startOfWeek(timestamp: number): number {
  const date = new Date(startOfDay(timestamp));
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return date.getTime();
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(timestamp: number): number {
  return (new Date(timestamp).getDay() + 6) % 7;
}

/** "Today", "Yesterday", "Tue 12 Nov" or "12 Nov 2025". */
export function formatRelativeDate(timestamp: number, now = Date.now()): string {
  const days = Math.round((startOfDay(now) - startOfDay(timestamp)) / DAY_MS);
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Yesterday';
  }
  const date = new Date(timestamp);
  if (days < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: sameYear ? undefined : 'numeric',
  });
}

/** "3 days ago", "2 weeks ago", "never". */
export function formatAgo(timestamp: number | null, now = Date.now()): string {
  if (timestamp === null) {
    return 'Not done yet';
  }
  const days = Math.round((startOfDay(now) - startOfDay(timestamp)) / DAY_MS);
  if (days <= 0) {
    return 'Done today';
  }
  if (days === 1) {
    return 'Done yesterday';
  }
  if (days < 14) {
    return `${days} days ago`;
  }
  const weeks = Math.round(days / 7);
  return `${weeks} weeks ago`;
}

/** "12 Nov" for chart labels. */
export function formatShortDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
