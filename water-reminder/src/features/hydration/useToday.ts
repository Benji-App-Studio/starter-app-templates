import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { recordDayGoal } from '@/db/dayGoals';
import { createDrink, deleteDrink, listDrinks, type Drink } from '@/db/drinks';

import { dayKey } from './dates';

/** Today's drinks, refreshed whenever the screen gains focus (so midnight rolls the day over). */
export function useToday(goalMl: number) {
  const [drinks, setDrinks] = useState<Drink[]>();

  const refresh = useCallback(async () => {
    setDrinks(await listDrinks(dayKey()));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const totalMl = (drinks ?? []).reduce((sum, drink) => sum + drink.amountMl, 0);

  async function log(amountMl: number) {
    const today = dayKey();
    await createDrink(today, amountMl);
    await recordDayGoal(today, goalMl);
    await refresh();
  }

  async function remove(id: number) {
    await deleteDrink(id);
    await refresh();
  }

  return { drinks, totalMl, log, remove, refresh };
}
