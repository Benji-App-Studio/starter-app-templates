import { useEffect, useState } from 'react';
import { runOnJS, useAnimatedReaction, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text, type TextProps } from '@/components/Text';

type CountUpProps = Omit<TextProps, 'children'> & {
  value: number;
  /** Turns the animated whole number into the text to show. */
  format?: (value: number) => string;
};

/** A number that springs from its previous value to the new one instead of jumping. */
export function CountUp({ value, format = String, ...rest }: CountUpProps) {
  const progress = useSharedValue(value);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    progress.set(withSpring(value, { damping: 22, stiffness: 90 }));
  }, [value, progress]);

  useAnimatedReaction(
    () => Math.round(progress.get()),
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setShown)(current);
      }
    },
  );

  return (
    <Text tabular {...rest}>
      {format(shown)}
    </Text>
  );
}
