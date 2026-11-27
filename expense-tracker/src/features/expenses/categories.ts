import type { IconName } from '@/components';

export type Category = {
  id: string;
  label: string;
  icon: IconName;
  /** Index into `theme.categoryTints`. */
  tint: number;
  /** Share of the monthly budget before the onboarding answer shifts it, in percent. */
  weight: number;
};

/** The spending categories. Edit labels and weights here; budgets and reports follow. */
export const categories: Category[] = [
  { id: 'food', label: 'Food & drink', icon: 'food', tint: 0, weight: 20 },
  { id: 'groceries', label: 'Groceries', icon: 'groceries', tint: 1, weight: 15 },
  { id: 'transport', label: 'Transport', icon: 'transport', tint: 2, weight: 10 },
  { id: 'shopping', label: 'Shopping', icon: 'shopping', tint: 3, weight: 15 },
  { id: 'bills', label: 'Bills', icon: 'bills', tint: 4, weight: 20 },
  { id: 'fun', label: 'Going out', icon: 'fun', tint: 5, weight: 10 },
  { id: 'health', label: 'Health', icon: 'health', tint: 6, weight: 5 },
  { id: 'other', label: 'Other', icon: 'other', tint: 7, weight: 5 },
];

const fallback = categories[categories.length - 1];

export function categoryById(id: string): Category {
  return categories.find((category) => category.id === id) ?? fallback;
}
