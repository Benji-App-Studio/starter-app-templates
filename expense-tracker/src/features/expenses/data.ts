import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { deleteAllBudgets, listBudgets, seedBudgets, setBudget } from '@/db/budgets';
import {
  countExpenses,
  createExpense,
  deleteAllExpenses,
  deleteExpense,
  getExpense,
  listExpenses,
  sumExpenses,
  updateExpense,
  type Expense,
  type ExpenseInput,
} from '@/db/expenses';
import { useAppState } from '@/state/appState';

import { periodBudget, planFromAnswers } from './budgetPlan';
import { categories } from './categories';
import { dayIndex, daysInPeriod, periodContaining, shiftPeriod, type Period } from './period';
import { preferences, usePreferences } from './preferences';

/*
 * Writes go through this module so every screen reloads after a change:
 * a version counter bumps, and the hooks below re-query.
 */
let version = 0;
const listeners = new Set<() => void>();

function notifyChanged() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function useDataVersion(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => version,
    () => version,
  );
}

/** The current budget month, from the Settings start day or the onboarding payday answer. */
export function useBudgetPeriod(): Period {
  const { periodStartDay } = usePreferences();
  const { onboardingAnswers } = useAppState();
  const startDay = periodStartDay ?? planFromAnswers(onboardingAnswers).startDay;
  const today = new Date().toDateString();
  return useMemo(() => periodContaining(Date.now(), startDay), [startDay, today]);
}

export type PeriodSummary = {
  period: Period;
  expenses: Expense[];
  /** Limit per category id as the user set it for a whole month; 0 or missing means no limit. */
  monthlyLimits: Record<string, number>;
  monthlyBudgetCents: number;
  /**
   * What this month gets (see `periodBudget`): the monthly limits, prorated in the month the user
   * started in. Every number shown against spending reads these.
   */
  limits: Record<string, number>;
  budgetCents: number;
  /** First day of the month the budget covers; 0 unless the user started mid-month. */
  firstDayIndex: number;
  spentByCategory: Record<string, number>;
  /** Spend per day of the period, index 0 = first day. Feeds the runway. */
  spentByDay: number[];
  spentCents: number;
};

async function loadSummary(period: Period, answers: Record<string, string>): Promise<PeriodSummary> {
  await preferences.ready();
  await seedBudgets(planFromAnswers(answers).budgets);
  const [expenses, budgets] = await Promise.all([listExpenses(period.start, period.end), listBudgets()]);

  const monthlyLimits: Record<string, number> = {};
  for (const budget of budgets) {
    monthlyLimits[budget.categoryId] = budget.limitCents;
  }
  const { limits, budgetCents, firstDayIndex } = periodBudget(period, preferences.get().startedAt, monthlyLimits);
  const spentByCategory: Record<string, number> = {};
  for (const category of categories) {
    spentByCategory[category.id] = 0;
  }
  const spentByDay = new Array<number>(daysInPeriod(period)).fill(0);
  for (const expense of expenses) {
    spentByCategory[expense.categoryId] = (spentByCategory[expense.categoryId] ?? 0) + expense.amountCents;
    spentByDay[dayIndex(period, expense.spentAt)] += expense.amountCents;
  }

  return {
    period,
    expenses,
    monthlyLimits,
    monthlyBudgetCents: budgets.reduce((sum, budget) => sum + budget.limitCents, 0),
    limits,
    budgetCents,
    firstDayIndex,
    spentByCategory,
    spentByDay,
    spentCents: expenses.reduce((sum, expense) => sum + expense.amountCents, 0),
  };
}

/** Everything a screen needs about one budget month. Undefined while loading. */
export function usePeriodSummary(period: Period): PeriodSummary | undefined {
  const dataVersion = useDataVersion();
  const { onboardingAnswers } = useAppState();
  // Read inside loadSummary; listed here so the summary reloads when the start date changes.
  const { startedAt } = usePreferences();
  const [summary, setSummary] = useState<PeriodSummary>();

  useEffect(() => {
    let cancelled = false;
    loadSummary(period, onboardingAnswers).then((next) => {
      if (!cancelled) {
        setSummary(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [period, onboardingAnswers, startedAt, dataVersion]);

  return summary;
}

export type PeriodTotal = { period: Period; spentCents: number };

/** Spend per month for the last `count` months, oldest first, ending with `period`. */
export function usePeriodHistory(period: Period, count: number): PeriodTotal[] | undefined {
  const dataVersion = useDataVersion();
  const [history, setHistory] = useState<PeriodTotal[]>();

  useEffect(() => {
    let cancelled = false;
    const periods = Array.from({ length: count }, (_, index) => shiftPeriod(period, index - count + 1));
    Promise.all(
      periods.map(async (item) => ({ period: item, spentCents: await sumExpenses(item.start, item.end) })),
    ).then((next) => {
      if (!cancelled) {
        setHistory(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [period, count, dataVersion]);

  return history;
}

/** True once the user has ever logged anything. Undefined while loading. */
export function useHasExpenses(): boolean | undefined {
  const dataVersion = useDataVersion();
  const [has, setHas] = useState<boolean>();

  useEffect(() => {
    let cancelled = false;
    countExpenses().then((count) => {
      if (!cancelled) {
        setHas(count > 0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dataVersion]);

  return has;
}

export function useExpense(id: number | undefined): Expense | undefined {
  const [expense, setExpense] = useState<Expense>();

  useEffect(() => {
    if (id === undefined) {
      return;
    }
    getExpense(id).then(setExpense);
  }, [id]);

  return expense;
}

export async function saveExpense(input: ExpenseInput, id?: number): Promise<void> {
  if (id === undefined) {
    await createExpense(input);
  } else {
    await updateExpense(id, input);
  }
  notifyChanged();
}

export async function removeExpense(id: number): Promise<void> {
  await deleteExpense(id);
  notifyChanged();
}

export async function saveBudget(categoryId: string, limitCents: number): Promise<void> {
  await setBudget(categoryId, limitCents);
  notifyChanged();
}

/** Deletes every expense and budget. Budgets come back from the onboarding answers on next load. */
export async function resetData(): Promise<void> {
  await Promise.all([deleteAllExpenses(), deleteAllBudgets()]);
  notifyChanged();
}

export { notifyChanged };
