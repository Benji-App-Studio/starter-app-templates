import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';

export type RestTimer = {
  /** Milliseconds left, 0 when idle. */
  remainingMs: number;
  totalMs: number;
  /** Wall-clock end, for animating the drain bar. Undefined when idle. */
  endsAt: number | undefined;
  running: boolean;
  start: (seconds: number) => void;
  /** Adds (or removes) seconds from the running timer. */
  adjust: (seconds: number) => void;
  skip: () => void;
};

/** A countdown keyed on a wall-clock end time, so it stays right if the JS thread stalls. */
export function useRestTimer(): RestTimer {
  const [endsAt, setEndsAt] = useState<number>();
  const [totalMs, setTotalMs] = useState(0);
  const [now, setNow] = useState(Date.now());
  const finished = useRef(false);

  useEffect(() => {
    if (endsAt === undefined) {
      return;
    }
    const interval = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(interval);
  }, [endsAt]);

  const remainingMs = endsAt === undefined ? 0 : Math.max(0, endsAt - now);

  useEffect(() => {
    if (endsAt !== undefined && remainingMs === 0 && !finished.current) {
      finished.current = true;
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const timeout = setTimeout(() => setEndsAt(undefined), 900);
      return () => clearTimeout(timeout);
    }
  }, [endsAt, remainingMs]);

  const start = useCallback((seconds: number) => {
    finished.current = false;
    const current = Date.now();
    setNow(current);
    setTotalMs(seconds * 1000);
    setEndsAt(current + seconds * 1000);
  }, []);

  const adjust = useCallback((seconds: number) => {
    setEndsAt((current) => (current === undefined ? current : Math.max(Date.now(), current + seconds * 1000)));
    setTotalMs((current) => Math.max(1000, current + seconds * 1000));
  }, []);

  const skip = useCallback(() => {
    finished.current = true;
    setEndsAt(undefined);
  }, []);

  return { remainingMs, totalMs, endsAt, running: endsAt !== undefined, start, adjust, skip };
}
