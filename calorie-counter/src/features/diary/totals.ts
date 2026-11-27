import type { FoodLog } from '@/db/foodLogs';

export type Totals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const EMPTY_TOTALS: Totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export function sumLogs(logs: FoodLog[]): Totals {
  return logs.reduce<Totals>(
    (sum, log) => ({
      calories: sum.calories + log.calories,
      protein: sum.protein + log.protein,
      carbs: sum.carbs + log.carbs,
      fat: sum.fat + log.fat,
    }),
    EMPTY_TOTALS,
  );
}

export function formatKcal(value: number): string {
  return Math.round(value).toLocaleString();
}
