import { createFoodLog, deleteAllFoodLogs, type Meal } from '@/db/foodLogs';

import { shiftDay, todayKey } from './days';
import { foods, type Food } from './foods';

const DAYS = 12;

/** Picks by index so the same sample set comes back every time. */
function pick(ids: string[]): Food[] {
  return ids.map((id) => foods.find((food) => food.id === id)).filter((food): food is Food => food !== undefined);
}

const menus: Record<Meal, Food[][]> = {
  breakfast: [pick(['oatmeal', 'banana', 'coffee']), pick(['egg', 'egg', 'toast', 'latte']), pick(['greek-yogurt', 'berries'])],
  lunch: [pick(['caesar']), pick(['sandwich', 'apple']), pick(['burrito']), pick(['sushi'])],
  dinner: [pick(['salmon', 'rice', 'broccoli']), pick(['chicken-breast', 'sweet-potato', 'salad']), pick(['pasta', 'olive-oil']), pick(['pizza', 'pizza', 'beer'])],
  snack: [pick(['almonds']), pick(['protein-bar']), pick(['chocolate']), []],
};

/**
 * Replaces every log with twelve believable days ending today (today stops
 * after lunch so the ring is part way). Development only, for screenshots.
 */
export async function loadSampleData() {
  await deleteAllFoodLogs();
  const today = todayKey();
  const meals: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  for (let offset = DAYS - 1; offset >= 0; offset -= 1) {
    const day = shiftDay(today, -offset);
    for (const meal of meals) {
      if (offset === 0 && (meal === 'dinner' || meal === 'snack')) {
        continue;
      }
      const options = menus[meal];
      const menu = options[(offset * 7 + meal.length) % options.length];
      for (const food of menu) {
        const servings = food.id === 'pizza' || food.id === 'egg' ? 1 : offset % 3 === 1 ? 1.5 : 1;
        await createFoodLog({
          day,
          meal,
          name: food.name,
          servings,
          calories: Math.round(food.calories * servings),
          protein: food.protein * servings,
          carbs: food.carbs * servings,
          fat: food.fat * servings,
        });
      }
    }
  }
}
