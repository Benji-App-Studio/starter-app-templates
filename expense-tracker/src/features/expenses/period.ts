/** One budget month: `[start, end)` in Unix milliseconds, starting on `startDay` of each month. */
export type Period = {
  start: number;
  end: number;
  startDay: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Start days offered in onboarding and Settings. */
export const startDays = [1, 15, 25] as const;

function monthStart(year: number, monthIndex: number, startDay: number): number {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  return new Date(year, monthIndex, Math.min(startDay, daysInMonth)).getTime();
}

export function periodContaining(time: number, startDay: number): Period {
  const date = new Date(time);
  const year = date.getFullYear();
  let month = date.getMonth();
  if (time < monthStart(year, month, startDay)) {
    month -= 1;
  }
  return { start: monthStart(year, month, startDay), end: monthStart(year, month + 1, startDay), startDay };
}

/** The period `by` months before (negative) or after the given one. */
export function shiftPeriod(period: Period, by: number): Period {
  const start = new Date(period.start);
  return periodContaining(
    monthStart(start.getFullYear(), start.getMonth() + by, period.startDay),
    period.startDay,
  );
}

export function daysInPeriod(period: Period): number {
  return Math.round((period.end - period.start) / DAY_MS);
}

/** Days still to budget for, counting today. At least 1 while the period is running. */
export function daysLeft(period: Period, now: number): number {
  if (now >= period.end) {
    return 0;
  }
  return Math.max(1, Math.ceil((period.end - now) / DAY_MS));
}

/** "November" when the month starts on the 1st, otherwise "15 Nov – 14 Dec". */
export function periodLabel(period: Period): string {
  const start = new Date(period.start);
  if (period.startDay === 1) {
    return start.toLocaleDateString(undefined, { month: 'long' });
  }
  const last = new Date(period.end - DAY_MS);
  const short = { month: 'short', day: 'numeric' } as const;
  return `${start.toLocaleDateString(undefined, short)} – ${last.toLocaleDateString(undefined, short)}`;
}

/** Zero-based day of the period that `time` falls on, clamped to the period. */
export function dayIndex(period: Period, time: number): number {
  const index = Math.round((startOfDay(time) - startOfDay(period.start)) / DAY_MS);
  return Math.min(Math.max(0, index), daysInPeriod(period) - 1);
}

/** "Nov 1" and "Nov 30": the first and last day, for labels under the runway. */
export function periodEdgeLabels(period: Period): [string, string] {
  const short = { month: 'short', day: 'numeric' } as const;
  return [
    new Date(period.start).toLocaleDateString(undefined, short),
    new Date(period.end - DAY_MS).toLocaleDateString(undefined, short),
  ];
}

/** "November": the month the period starts in. */
export function periodMonthName(period: Period): string {
  return new Date(period.start).toLocaleDateString(undefined, { month: 'long' });
}

/** "Nov" style tick label for charts. */
export function periodShortLabel(period: Period): string {
  return new Date(period.start).toLocaleDateString(undefined, { month: 'short' });
}

/** "1st", "15th", "25th". */
export function ordinalDay(day: number): string {
  const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  return `${day}${suffix}`;
}

export function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** "Today", "Yesterday", or "Mon 24 Nov". */
export function dayLabel(time: number, now: number): string {
  const day = startOfDay(time);
  const today = startOfDay(now);
  if (day === today) {
    return 'Today';
  }
  if (day === today - DAY_MS) {
    return 'Yesterday';
  }
  return new Date(day).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export { DAY_MS };
