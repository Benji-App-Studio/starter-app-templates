import type { Budget } from '@/db/budgets';

import { categories, categoryById } from './categories';
import { dayIndex, daysInPeriod, type Period } from './period';

/** Monthly budget behind each onboarding `budget` answer, in cents. */
const budgetBands: Record<string, number> = {
  'under-1000': 80_000,
  '1000-2000': 150_000,
  '2000-3500': 275_000,
  'over-3500': 400_000,
};

/** Reset day behind each onboarding `payday` answer. */
const paydayStartDays: Record<string, number> = {
  first: 1,
  fifteenth: 15,
  'twenty-fifth': 25,
  unsure: 1,
};

const DEFAULT_MONTHLY_CENTS = 150_000;
const TOP_CATEGORY_WEIGHT = 30;
const ROUND_TO_CENTS = 1_000;

export type BudgetPlan = {
  monthlyCents: number;
  startDay: number;
  topCategoryId: string;
  /** One budget per category; they add up to `monthlyCents`. */
  budgets: Budget[];
};

/**
 * Turns the onboarding answers into the starting budgets. The category the user
 * spends most on takes 30%; the others share the rest in their usual proportions.
 */
export function planFromAnswers(answers: Record<string, string>): BudgetPlan {
  const monthlyCents = budgetBands[answers.budget ?? ''] ?? DEFAULT_MONTHLY_CENTS;
  const startDay = paydayStartDays[answers.payday ?? ''] ?? 1;
  const topCategoryId = categoryById(answers.topCategory ?? 'food').id;

  const topWeight = categoryById(topCategoryId).weight;
  const restScale = (100 - TOP_CATEGORY_WEIGHT) / (100 - topWeight);

  const budgets: Budget[] = categories.map((category) => {
    const weight = category.id === topCategoryId ? TOP_CATEGORY_WEIGHT : category.weight * restScale;
    const exact = (monthlyCents * weight) / 100;
    return { categoryId: category.id, limitCents: Math.round(exact / ROUND_TO_CENTS) * ROUND_TO_CENTS };
  });

  // Rounding each line to a round number leaves a remainder; "Other" absorbs it so the total is exact.
  const other = budgets.find((budget) => budget.categoryId === 'other');
  if (other) {
    const assigned = budgets.reduce((sum, budget) => sum + budget.limitCents, 0) - other.limitCents;
    other.limitCents = Math.max(0, monthlyCents - assigned);
  }

  return { monthlyCents, startDay, topCategoryId, budgets };
}

export type PeriodBudget = {
  /** Zero-based first day the budget covers: the onboarding day in the starting month, otherwise 0. */
  firstDayIndex: number;
  /** Limit per category id for this month, scaled to the covered days. */
  limits: Record<string, number>;
  budgetCents: number;
};

/**
 * The budget one month gets. The month the user finished onboarding in only covers the days from
 * that day on, so every limit is scaled to those days; months before and after get the full limits.
 * Today, Budgets and Report all read this, so the three screens show the same numbers.
 */
export function periodBudget(
  period: Period,
  startedAt: number | undefined,
  monthlyLimits: Record<string, number>,
): PeriodBudget {
  const monthlyCents = Object.values(monthlyLimits).reduce((sum, cents) => sum + cents, 0);
  const startsInside = startedAt !== undefined && startedAt > period.start && startedAt < period.end;
  const firstDayIndex = startsInside ? dayIndex(period, startedAt) : 0;
  if (firstDayIndex === 0) {
    return { firstDayIndex, limits: { ...monthlyLimits }, budgetCents: monthlyCents };
  }

  const days = daysInPeriod(period);
  const share = (days - firstDayIndex) / days;
  const budgetCents = Math.round(monthlyCents * share);

  // Rounding each limit on its own drifts a few cents from the total; the leftover cents go to the
  // limits with the largest fractions, so the rows and the ring add up to the total exactly.
  const scaled = Object.entries(monthlyLimits).map(([categoryId, cents]) => {
    const exact = cents * share;
    return { categoryId, cents: Math.floor(exact), fraction: exact - Math.floor(exact) };
  });
  let leftover = budgetCents - scaled.reduce((sum, item) => sum + item.cents, 0);
  for (const item of [...scaled].sort((a, b) => b.fraction - a.fraction)) {
    if (leftover <= 0) {
      break;
    }
    if (item.fraction > 0) {
      item.cents += 1;
      leftover -= 1;
    }
  }

  const limits: Record<string, number> = {};
  for (const item of scaled) {
    limits[item.categoryId] = item.cents;
  }
  return { firstDayIndex, limits, budgetCents };
}
