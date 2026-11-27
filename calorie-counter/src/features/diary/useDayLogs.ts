import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { deleteFoodLog, listFoodLogs, type FoodLog } from '@/db/foodLogs';

import { sumLogs } from './totals';

/** The logs of one day, reloaded whenever the screen regains focus (e.g. after the log sheet closes). */
export function useDayLogs(day: string) {
  const [logs, setLogs] = useState<FoodLog[]>();

  const refresh = useCallback(() => {
    listFoodLogs(day)
      .then(setLogs)
      .catch(() => setLogs([]));
  }, [day]);

  useFocusEffect(refresh);

  const remove = useCallback(
    async (log: FoodLog) => {
      await deleteFoodLog(log.id);
      refresh();
    },
    [refresh],
  );

  const totals = useMemo(() => sumLogs(logs ?? []), [logs]);

  return { logs, totals, refresh, remove };
}
