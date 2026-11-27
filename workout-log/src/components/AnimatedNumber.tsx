import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { Text, type TextProps } from '@/components/Text';

const DURATION_MS = 550;

/** Eases a displayed number towards `target` whenever it changes. */
function useCountUp(target: number): number {
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    if (reducedMotion || from.current === target) {
      from.current = target;
      setShown(target);
      return;
    }
    const start = from.current;
    const startedAt = Date.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - startedAt) / DURATION_MS);
      const eased = 1 - (1 - t) ** 3;
      setShown(start + (target - start) * eased);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        from.current = target;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, target]);

  return shown;
}

type AnimatedNumberProps = Omit<TextProps, 'children'> & {
  value: number;
  format?: (value: number) => string;
};

/** A number that counts up (or down) to its new value instead of jumping. */
export function AnimatedNumber({ value, format = (shown) => Math.round(shown).toString(), ...rest }: AnimatedNumberProps) {
  const shown = useCountUp(value);
  return <Text {...rest}>{format(shown)}</Text>;
}
