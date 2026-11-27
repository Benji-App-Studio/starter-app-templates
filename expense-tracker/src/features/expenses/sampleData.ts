import { createExpense, type ExpenseInput } from '@/db/expenses';

import { notifyChanged } from './data';
import { DAY_MS, shiftPeriod, type Period } from './period';
import { preferences } from './preferences';

type Sample = { categoryId: string; note: string; cents: number; day: number; hour: number };

/** Six weeks of a believable month, days counted from the start of the period. */
const monthTemplate: Sample[] = [
  { categoryId: 'bills', note: 'Phone plan', cents: 4500, day: 1, hour: 9 },
  { categoryId: 'groceries', note: 'Weekly shop', cents: 8640, day: 1, hour: 18 },
  { categoryId: 'food', note: 'Coffee', cents: 475, day: 2, hour: 8 },
  { categoryId: 'transport', note: 'Metro card', cents: 3300, day: 2, hour: 8 },
  { categoryId: 'food', note: 'Lunch with Sam', cents: 2340, day: 3, hour: 13 },
  { categoryId: 'fun', note: 'Cinema', cents: 2800, day: 4, hour: 20 },
  { categoryId: 'health', note: 'Pharmacy', cents: 1890, day: 5, hour: 11 },
  { categoryId: 'food', note: 'Coffee', cents: 475, day: 6, hour: 8 },
  { categoryId: 'shopping', note: 'Running shoes', cents: 11900, day: 7, hour: 15 },
  { categoryId: 'groceries', note: 'Weekly shop', cents: 7920, day: 8, hour: 18 },
  { categoryId: 'bills', note: 'Electricity', cents: 7200, day: 9, hour: 9 },
  { categoryId: 'food', note: 'Takeaway', cents: 3150, day: 10, hour: 19 },
  { categoryId: 'fun', note: 'Drinks', cents: 4200, day: 11, hour: 21 },
  { categoryId: 'transport', note: 'Taxi home', cents: 1850, day: 11, hour: 23 },
  { categoryId: 'food', note: 'Coffee', cents: 475, day: 12, hour: 8 },
  { categoryId: 'other', note: 'Birthday card', cents: 650, day: 13, hour: 16 },
  { categoryId: 'groceries', note: 'Weekly shop', cents: 9110, day: 15, hour: 18 },
  { categoryId: 'shopping', note: 'Book', cents: 1899, day: 16, hour: 12 },
  { categoryId: 'food', note: 'Brunch', cents: 2600, day: 18, hour: 11 },
  { categoryId: 'health', note: 'Gym', cents: 3900, day: 19, hour: 7 },
  { categoryId: 'transport', note: 'Fuel', cents: 5200, day: 21, hour: 17 },
  { categoryId: 'groceries', note: 'Weekly shop', cents: 8380, day: 22, hour: 18 },
  { categoryId: 'fun', note: 'Concert tickets', cents: 6500, day: 24, hour: 20 },
  { categoryId: 'food', note: 'Coffee', cents: 475, day: 26, hour: 8 },
  { categoryId: 'bills', note: 'Streaming', cents: 1599, day: 27, hour: 9 },
];

/**
 * Development only: fills the current and five previous months so every screen
 * can be seen populated (and photographed for the App Store listing).
 */
export async function loadSampleData(period: Period): Promise<void> {
  // Six months of history: the budget covers whole months, not just the days since onboarding.
  preferences.set({ startedAt: undefined });
  const now = Date.now();
  const rows: ExpenseInput[] = [];

  for (let monthsBack = 5; monthsBack >= 0; monthsBack -= 1) {
    const target = shiftPeriod(period, -monthsBack);
    // Earlier months vary a little so the chart is not flat.
    const scale = [1.08, 0.94, 1.15, 0.9, 1.02, 1][monthsBack];
    for (const sample of monthTemplate) {
      const spentAt = target.start + (sample.day - 1) * DAY_MS + sample.hour * 60 * 60 * 1000;
      if (spentAt > now) {
        continue;
      }
      rows.push({
        amountCents: Math.round((sample.cents * scale) / 5) * 5,
        categoryId: sample.categoryId,
        note: sample.note,
        spentAt,
      });
    }
  }

  for (const row of rows) {
    await createExpense(row);
  }
  notifyChanged();
}
