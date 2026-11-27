import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { Text, type TextProps } from '@/components/Text';

type CountUpTextProps = Omit<TextProps, 'children'> & {
  value: number;
  /** Turns the animated number into the string shown, e.g. adds separators or a unit. */
  format: (value: number) => string;
  durationMs?: number;
};

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Shows a number that counts from its previous value to the new one when it changes. */
export function CountUpText({ value, format, durationMs = 520, ...textProps }: CountUpTextProps) {
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);

  useEffect(() => {
    const from = shownRef.current;
    if (from === value) {
      return;
    }
    if (reducedMotion) {
      shownRef.current = value;
      setShown(value);
      return;
    }

    const start = Date.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / durationMs);
      const next = from + (value - from) * easeOutCubic(t);
      shownRef.current = next;
      setShown(next);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs, reducedMotion]);

  return <Text {...textProps}>{format(shown)}</Text>;
}
