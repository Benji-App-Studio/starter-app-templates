import { addDays } from './dates';

/** Consecutive days ending today, or yesterday if today is not logged yet. */
export function currentStreak(days: ReadonlySet<string>, today: string): number {
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive days in an ascending list. */
export function longestStreak(daysAscending: readonly string[]): number {
  let best = 0;
  let run = 0;
  let previous: string | undefined;
  for (const day of daysAscending) {
    run = previous !== undefined && addDays(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}

export type GrowthStage = {
  name: string;
  /** Streak length that reaches this stage. */
  from: number;
};

/** The companion that grows with the streak (drawn in `Plant.tsx`): a plant, not a pet to feed. */
export const growthStages: readonly GrowthStage[] = [
  { name: 'Seed', from: 0 },
  { name: 'Sprout', from: 1 },
  { name: 'Bud', from: 3 },
  { name: 'Bloom', from: 7 },
  { name: 'Garden', from: 21 },
];

export function stageForStreak(streak: number): { stage: GrowthStage; next?: GrowthStage } {
  let stage = growthStages[0];
  let next: GrowthStage | undefined;
  for (const candidate of growthStages) {
    if (streak >= candidate.from) {
      stage = candidate;
    } else {
      next = candidate;
      break;
    }
  }
  return { stage, next };
}
