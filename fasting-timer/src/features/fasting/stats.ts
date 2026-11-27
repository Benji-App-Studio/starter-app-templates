import type { Fast } from '@/db/fasts';

import { HOUR_MS, addDays, dayNumber, formatWeekday } from './time';

/** Elapsed time of a fast; a running fast is measured up to `now`. */
export function fastDuration(fast: Fast, now: number): number {
  return Math.max(0, (fast.endedAt ?? now) - fast.startedAt);
}

export function goalMs(fast: Pick<Fast, 'goalHours'>): number {
  return fast.goalHours * HOUR_MS;
}

export function isGoalReached(fast: Fast, now: number): boolean {
  return fastDuration(fast, now) >= goalMs(fast);
}

export type Streaks = {
  /** Days in a row with a completed fast, counting today or yesterday as the latest. */
  current: number;
  longest: number;
};

/** A day counts when a fast reached its goal and ended on that day. */
export function computeStreaks(fasts: Fast[], now: number): Streaks {
  const days = new Set<number>();
  for (const fast of fasts) {
    if (fast.endedAt !== null && isGoalReached(fast, now)) {
      days.add(dayNumber(fast.endedAt));
    }
  }
  if (days.size === 0) {
    return { current: 0, longest: 0 };
  }

  const sorted = [...days].sort((a, b) => a - b);
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    run = sorted[i] - sorted[i - 1] === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = dayNumber(now);
  let cursor = days.has(today) ? today : days.has(today - 1) ? today - 1 : undefined;
  let current = 0;
  while (cursor !== undefined && days.has(cursor)) {
    current += 1;
    cursor -= 1;
  }

  return { current, longest };
}

export type DayHours = {
  /** Start of the day in milliseconds. */
  date: number;
  label: string;
  hours: number;
  isToday: boolean;
};

/** Hours fasted per day over the last seven days. A fast counts on the day it ended; the running one counts today. */
export function weeklyHours(fasts: Fast[], active: Fast | null, now: number): DayHours[] {
  const today = dayNumber(now);
  const hoursByDay = new Map<number, number>();
  for (const fast of fasts) {
    if (fast.endedAt === null) continue;
    const day = dayNumber(fast.endedAt);
    hoursByDay.set(day, (hoursByDay.get(day) ?? 0) + fastDuration(fast, now) / HOUR_MS);
  }
  if (active) {
    hoursByDay.set(today, (hoursByDay.get(today) ?? 0) + fastDuration(active, now) / HOUR_MS);
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(now, index - 6);
    const day = dayNumber(date);
    return {
      date,
      label: formatWeekday(date),
      hours: hoursByDay.get(day) ?? 0,
      isToday: day === today,
    };
  });
}

export type Totals = {
  count: number;
  completed: number;
  totalHours: number;
  averageHours: number;
};

export function computeTotals(fasts: Fast[], now: number): Totals {
  const finished = fasts.filter((fast) => fast.endedAt !== null);
  const totalMs = finished.reduce((sum, fast) => sum + fastDuration(fast, now), 0);
  return {
    count: finished.length,
    completed: finished.filter((fast) => isGoalReached(fast, now)).length,
    totalHours: totalMs / HOUR_MS,
    averageHours: finished.length ? totalMs / HOUR_MS / finished.length : 0,
  };
}
