import type { Meal } from '@/db/foodLogs';

export const MEALS: { id: Meal; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks' },
];

export function isMeal(value: string | undefined): value is Meal {
  return MEALS.some((meal) => meal.id === value);
}

export function mealLabel(meal: Meal): string {
  return MEALS.find((candidate) => candidate.id === meal)?.label ?? meal;
}

/** The meal most people are logging at this hour. */
export function mealForTime(date = new Date()): Meal {
  const hour = date.getHours();
  if (hour < 11) {
    return 'breakfast';
  }
  if (hour < 15) {
    return 'lunch';
  }
  if (hour < 21) {
    return 'dinner';
  }
  return 'snack';
}
