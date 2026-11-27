/** Local calendar days as `YYYY-MM-DD`, the key the drinks table groups by. */

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function dayKey(date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDay(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

export function addDays(day: string, delta: number): string {
  const date = parseDay(day);
  date.setDate(date.getDate() + delta);
  return dayKey(date);
}

/** The last `count` days ending today, oldest first. */
export function recentDays(count: number, today = dayKey()): string[] {
  return Array.from({ length: count }, (_, index) => addDays(today, index - (count - 1)));
}

/** "Today", "Yesterday", then "Mon 24 Nov". */
export function formatDayLabel(day: string, today = dayKey()): string {
  if (day === today) {
    return 'Today';
  }
  if (day === addDays(today, -1)) {
    return 'Yesterday';
  }
  return parseDay(day).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

/** "Thursday 27 November", for the Today header. */
export function formatLongDate(date = new Date()): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "8:00" or "22:00" from an hour of the day. */
export function formatHour(hour: number): string {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
