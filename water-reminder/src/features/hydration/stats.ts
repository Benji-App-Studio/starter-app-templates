import type { DayTotal } from '@/db/drinks';

import { addDays, dayKey } from './dates';

export type DaySummary = {
  day: string;
  totalMl: number;
  goalMl: number;
  reached: boolean;
};

/** Join totals with the goal that applied each day. Days without drinks are omitted. */
export function summariseDays(
  totals: DayTotal[],
  goals: Record<string, number>,
  currentGoalMl: number,
): DaySummary[] {
  return totals.map(({ day, totalMl }) => {
    const goalMl = goals[day] ?? currentGoalMl;
    return { day, totalMl, goalMl, reached: totalMl >= goalMl };
  });
}

/**
 * Consecutive days the goal was reached, counting back from today. Today only
 * counts once it is reached, so an unfinished day never breaks the streak.
 */
export function currentStreak(summaries: DaySummary[], today = dayKey()): number {
  const reachedDays = new Set(summaries.filter((entry) => entry.reached).map((entry) => entry.day));
  let day = reachedDays.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (reachedDays.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

/** Average total over the days that have at least one drink, or 0. */
export function averageMl(summaries: DaySummary[]): number {
  if (summaries.length === 0) {
    return 0;
  }
  const total = summaries.reduce((sum, entry) => sum + entry.totalMl, 0);
  return Math.round(total / summaries.length);
}
