import type { DailyTotal } from '@/db/sessions';

const DAY_MS = 86_400_000;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

/** Local calendar day as YYYY-MM-DD, matching `date(..., 'localtime')` in SQLite. */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The seven days of the week that contains `date`, Monday first. */
export function weekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  return Array.from({ length: 7 }, (_, index) => new Date(start.getTime() + index * DAY_MS));
}

export function totalsFor(totals: DailyTotal[], day: Date): DailyTotal {
  const key = dayKey(day);
  return totals.find((total) => total.day === key) ?? { day: key, minutes: 0, sessions: 0 };
}

export function weekMinutes(totals: DailyTotal[], today: Date): number {
  return weekDays(today).reduce((sum, day) => sum + totalsFor(totals, day).minutes, 0);
}

/**
 * Consecutive days with at least one finished session, counting back from
 * today. A day without a session so far does not break the streak until it ends.
 */
export function streakDays(totals: DailyTotal[], today: Date): number {
  const days = new Set(totals.filter((total) => total.sessions > 0).map((total) => total.day));
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** "45 min", "1h", "1h 20m". A worklet, so `AnimatedNumber` can call it on the UI thread. */
export function formatMinutes(minutes: number): string {
  'worklet';
  const rounded = Math.max(0, Math.round(minutes));
  if (rounded < 60) {
    return `${rounded} min`;
  }
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

/** "24:59" from milliseconds, rounding up so the dial never shows 00:00 while running. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  return `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`;
}

export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "Today", "Yesterday", or a short weekday + date. */
export function formatDay(key: string, today: Date): string {
  if (key === dayKey(today)) {
    return 'Today';
  }
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === dayKey(yesterday)) {
    return 'Yesterday';
  }
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
