import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getActiveAttempt, type Attempt } from '@/db/attempts';
import { countCravings } from '@/db/cravings';

type ActiveAttemptState = {
  loaded: boolean;
  attempt: Attempt | undefined;
  /** Cravings logged during this attempt. */
  cravings: number;
};

/** The current attempt and its craving count, reloaded every time the screen is focused. */
export function useActiveAttempt(): ActiveAttemptState & { refresh: () => void } {
  const [state, setState] = useState<ActiveAttemptState>({ loaded: false, attempt: undefined, cravings: 0 });

  const refresh = useCallback(() => {
    let cancelled = false;
    void (async () => {
      const attempt = await getActiveAttempt();
      const cravings = attempt ? await countCravings(attempt.id) : 0;
      if (!cancelled) {
        setState({ loaded: true, attempt, cravings });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(refresh);

  return { ...state, refresh };
}
