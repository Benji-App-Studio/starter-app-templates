import { recordDayGoal } from '@/db/dayGoals';
import { createDrink, deleteAllDrinks } from '@/db/drinks';

import { addDays, dayKey, parseDay } from './dates';

const SAMPLE_DAYS = 21;
const SIZES = [250, 350, 500, 250, 150, 500, 350];
/** Fraction of the goal reached on each past day, newest first, so the history looks lived in. */
const PAST_DAY_RATIOS = [1.08, 0.72, 1.02, 1.15, 0.9, 1.05, 1.0, 0.55, 1.1, 1.0, 0.95, 1.2, 0.8, 1.0, 1.04, 0.6, 1.0, 1.1, 0.98, 1.0];
const TODAY_RATIO = 0.45;

/**
 * Three weeks of plausible drinks for screenshots and demos. Development only;
 * replaces whatever is logged.
 */
export async function loadSampleData(goalMl: number): Promise<void> {
  await deleteAllDrinks();
  const today = dayKey();

  for (let back = 0; back < SAMPLE_DAYS; back += 1) {
    const day = addDays(today, -back);
    const ratio = back === 0 ? TODAY_RATIO : PAST_DAY_RATIOS[(back - 1) % PAST_DAY_RATIOS.length];
    const target = goalMl * ratio;
    const start = parseDay(day).setHours(7, 40, 0, 0);
    const endHour = back === 0 ? Math.min(new Date().getHours(), 14) : 22;
    let poured = 0;
    let index = 0;
    while (poured < target) {
      const amount = SIZES[(index + back) % SIZES.length];
      const spread = Math.max(1, endHour - 7) * 60 * 60 * 1000;
      const loggedAt = start + Math.min(1, (poured + amount) / (target + amount)) * spread;
      await createDrink(day, amount, Math.round(loggedAt));
      poured += amount;
      index += 1;
    }
    await recordDayGoal(day, goalMl);
  }
}
