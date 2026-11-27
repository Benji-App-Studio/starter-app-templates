export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

/** "16h 12m", "45m" or "0m". */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / MINUTE_MS));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/** "10:12:45" for the running timer. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

/** "8:12 PM" in the device's clock format. */
export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** "8 PM" for the hour stepper. */
export function formatHour(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric' });
}

/** "Today", "Yesterday", "Tomorrow" or "Wed, Nov 26". */
export function formatDay(ms: number, now: number): string {
  const diff = dayNumber(ms) - dayNumber(now);
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';
  return new Date(ms).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

/** "Mon" for chart axes. */
export function formatWeekday(ms: number): string {
  return new Date(ms).toLocaleDateString([], { weekday: 'short' });
}

/**
 * The local calendar day as a plain integer, so consecutive days differ by one
 * even across daylight-saving changes.
 */
export function dayNumber(ms: number): number {
  const date = new Date(ms);
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

export function startOfDay(ms: number): number {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function addDays(ms: number, days: number): number {
  const date = new Date(ms);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

export function addHours(ms: number, hours: number): number {
  const date = new Date(ms);
  date.setHours(date.getHours() + hours);
  return date.getTime();
}

export function addMinutes(ms: number, minutes: number): number {
  const date = new Date(ms);
  date.setMinutes(date.getMinutes() + minutes);
  return date.getTime();
}

/** Today at the given hour, or tomorrow if that hour has passed. */
export function nextOccurrence(hour: number, minute: number, now: number): number {
  const date = new Date(now);
  date.setHours(hour, minute, 0, 0);
  return date.getTime() > now ? date.getTime() : addDays(date.getTime(), 1);
}
