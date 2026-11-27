import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { getActiveFast, listFasts, type Fast } from '@/db/fasts';

type FastingData = {
  /** Undefined until the first read finishes. */
  active: Fast | null | undefined;
  fasts: Fast[] | undefined;
  /** Ticks once a second while a fast runs. */
  now: number;
  refresh: () => void;
};

/** The running fast and the finished ones, reloaded whenever the screen comes back into focus. */
export function useFasting(): FastingData {
  const [active, setActive] = useState<Fast | null>();
  const [fasts, setFasts] = useState<Fast[]>();
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(() => {
    void Promise.all([getActiveFast(), listFasts()]).then(([nextActive, nextFasts]) => {
      setActive(nextActive);
      setFasts(nextFasts);
      setNow(Date.now());
    });
  }, []);

  useFocusEffect(refresh);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [active]);

  return { active, fasts, now, refresh };
}
