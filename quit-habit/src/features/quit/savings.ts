import type { Attempt } from '@/db/attempts';

import { DAY_MS } from './time';

export type Savings = { elapsedMs: number; money: number; units: number };

/** Money and units the attempt kept the user from spending, at `now` or when it ended. */
export function attemptSavings(attempt: Attempt, now: number): Savings {
  const end = attempt.endedAt ?? now;
  const elapsedMs = Math.max(0, end - attempt.startedAt);
  const days = elapsedMs / DAY_MS;
  return { elapsedMs, money: days * attempt.costPerDay, units: days * attempt.unitsPerDay };
}

export function totalSavings(attempts: Attempt[], now: number): Savings {
  return attempts.reduce<Savings>(
    (sum, attempt) => {
      const part = attemptSavings(attempt, now);
      return {
        elapsedMs: sum.elapsedMs + part.elapsedMs,
        money: sum.money + part.money,
        units: sum.units + part.units,
      };
    },
    { elapsedMs: 0, money: 0, units: 0 },
  );
}

/** Projected savings over `days` at the given daily rates, for the onboarding plan and paywall. */
export function projectedSavings(unitsPerDay: number, costPerDay: number, days: number) {
  return { money: costPerDay * days, units: unitsPerDay * days };
}
