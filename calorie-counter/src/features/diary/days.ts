/** Calendar days are stored as local `YYYY-MM-DD` keys so a late snack stays on the day it was eaten. */

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(): string {
  return toDayKey(new Date());
}

/** Local midnight of the day. */
export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function shiftDay(key: string, days: number): string {
  const date = parseDayKey(key);
  date.setDate(date.getDate() + days);
  return toDayKey(date);
}

/** Monday to Sunday of the week that contains `key`. */
export function weekOf(key: string): string[] {
  const date = parseDayKey(key);
  const offsetFromMonday = (date.getDay() + 6) % 7;
  const monday = shiftDay(key, -offsetFromMonday);
  return Array.from({ length: 7 }, (_, index) => shiftDay(monday, index));
}

export function weekdayInitial(key: string): string {
  return parseDayKey(key).toLocaleDateString(undefined, { weekday: 'narrow' });
}

export function dayOfMonth(key: string): number {
  return parseDayKey(key).getDate();
}

/** "Today", "Yesterday", or a short date like "Mon, 24 Nov". */
export function formatDay(key: string, style: 'short' | 'long' = 'short'): string {
  const today = todayKey();
  if (key === today) {
    return 'Today';
  }
  if (key === shiftDay(today, -1)) {
    return 'Yesterday';
  }
  const date = parseDayKey(key);
  return style === 'long'
    ? date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    : date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
