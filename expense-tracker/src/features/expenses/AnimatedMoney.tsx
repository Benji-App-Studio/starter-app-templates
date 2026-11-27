import { useEffect, useState } from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text, type TextProps } from '@/components/Text';

import { formatMoney } from './money';

type AnimatedMoneyProps = Omit<TextProps, 'children'> & {
  cents: number;
  currency: string;
};

/**
 * An amount that springs from its previous value to the new one, so the daily
 * allowance visibly counts down when an expense is saved. With Reduce Motion on
 * it changes at once.
 */
export function AnimatedMoney({ cents, currency, ...textProps }: AnimatedMoneyProps) {
  const reduceMotion = useReducedMotion();
  const value = useSharedValue(cents);
  const [shown, setShown] = useState(cents);

  useEffect(() => {
    value.value = reduceMotion
      ? cents
      : withSpring(cents, { damping: 24, stiffness: 120, overshootClamping: true });
  }, [cents, reduceMotion, value]);

  useAnimatedReaction(
    () => Math.round(value.value),
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setShown)(current);
      }
    },
    [],
  );

  // Whole-dollar targets stay whole while moving, so the text does not flicker between formats.
  const display = cents % 100 === 0 ? Math.round(shown / 100) * 100 : shown;

  return <Text {...textProps}>{formatMoney(display, currency)}</Text>;
}
