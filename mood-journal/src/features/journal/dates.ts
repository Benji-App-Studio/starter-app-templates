/** Calendar days are stored as local `YYYY-MM-DD` strings so a check-in never shifts with time zones. */

export function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromDayKey(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

export function todayKey(): string {
  return toDayKey(new Date());
}

export function addDays(day: string, delta: number): string {
  const date = fromDayKey(day);
  date.setDate(date.getDate() + delta);
  return toDayKey(date);
}

export function yearOf(day: string): number {
  return fromDayKey(day).getFullYear();
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function dayKeyFor(year: number, monthIndex: number, date: number): string {
  return toDayKey(new Date(year, monthIndex, date));
}

/** "Thursday, November 27" */
export function formatDayLong(day: string): string {
  return fromDayKey(day).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

/** "Nov 27" */
export function formatDayShort(day: string): string {
  return fromDayKey(day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** "Thu" */
export function formatWeekday(day: string): string {
  return fromDayKey(day).toLocaleDateString(undefined, { weekday: 'short' });
}

/** "9:41 PM" for a unix timestamp. */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "8:00 PM" for an hour of the day. */
export function formatHour(hour: number): string {
  return new Date(2000, 0, 1, hour).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function relativeDayLabel(day: string): string {
  const today = todayKey();
  if (day === today) {
    return 'Today';
  }
  if (day === addDays(today, -1)) {
    return 'Yesterday';
  }
  return formatDayLong(day);
}
