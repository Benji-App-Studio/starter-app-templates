/** Calendar helpers. Days are local calendar days keyed as 'YYYY-MM-DD'. */

const DAY_MS = 86_400_000;

export const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
export const WEEKDAYS = [1, 2, 3, 4, 5];
export const WEEKENDS = [0, 6];

/** Monday-first order of `Date.getDay()` values, as the UI lays out a week. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

export function monthShort(date: Date): string {
  return MONTH_SHORT[date.getMonth()];
}

/** "Thursday, November 27" */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

/** "Nov 27" */
export function formatShortDate(date: Date): string {
  return `${monthShort(date)} ${date.getDate()}`;
}

/** Scheduled weekdays as a person would say them. */
export function describeDays(days: number[]): string {
  const set = new Set(days);
  if (EVERY_DAY.every((day) => set.has(day))) {
    return 'Every day';
  }
  if (set.size === WEEKDAYS.length && WEEKDAYS.every((day) => set.has(day))) {
    return 'Weekdays';
  }
  if (set.size === WEEKENDS.length && WEEKENDS.every((day) => set.has(day))) {
    return 'Weekends';
  }
  return WEEK_ORDER.filter((day) => set.has(day))
    .map((day) => WEEKDAY_SHORT[day])
    .join(', ');
}

export function parseTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}

export function toTimeString(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** 'HH:MM' → the device's clock format, e.g. "6:30 PM". */
export function formatTime(time: string): string {
  const { hour, minute } = parseTime(time);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
