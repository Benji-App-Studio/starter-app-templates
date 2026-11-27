import { useLocalSearchParams } from 'expo-router';

import { LogFoodScreen } from '@/features/diary/LogFoodScreen';
import { isMeal, mealForTime } from '@/features/diary/meals';
import { todayKey } from '@/features/diary/days';

/** The log sheet. Opened with `?day=YYYY-MM-DD&meal=lunch`; both are optional. */
export default function LogRoute() {
  const { day, meal } = useLocalSearchParams<{ day?: string; meal?: string }>();
  return <LogFoodScreen day={day ?? todayKey()} initialMeal={isMeal(meal) ? meal : mealForTime()} />;
}
