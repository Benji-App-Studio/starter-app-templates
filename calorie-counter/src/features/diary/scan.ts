import type { NewFoodLog } from '@/db/foodLogs';

export type FoodEstimate = Pick<NewFoodLog, 'name' | 'calories' | 'protein' | 'carbs' | 'fat'>;

/**
 * Hook for photo logging in version two. An implementation owns the camera
 * and the vision API call; the log screen only needs the estimate back and
 * pre-fills the manual form with it. Resolve null when the user cancels.
 */
export type FoodScanner = {
  /** Button label on the log screen, e.g. "Scan a photo". */
  label: string;
  scan(): Promise<FoodEstimate | null>;
};

/** Set this to a `FoodScanner` and the log screen grows a scan button. */
export const foodScanner: FoodScanner | null = null;
