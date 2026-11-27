import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text, type TextProps } from '@/components/Text';
import { typography, type TypographyVariant } from '@/theme/theme';

type OdometerProps = {
  value: number;
  /** Pads with leading zeros, e.g. 2 for "07". */
  minDigits?: number;
  variant?: TypographyVariant;
  color?: TextProps['color'];
};

const DIGITS = Array.from({ length: 20 }, (_, index) => index % 10);
const SPRING = { damping: 18, stiffness: 170, mass: 0.7 };

/**
 * A number whose digits roll like a mechanical counter. Each digit is a column
 * of 0–9 (twice, so 9 → 0 rolls forward instead of spinning back) moved by a spring.
 */
export function Odometer({ value, minDigits = 1, variant = 'numeral', color = 'text' }: OdometerProps) {
  const digits = String(Math.max(0, Math.floor(value))).padStart(minDigits, '0').split('');
  const height = typography[variant].lineHeight;

  return (
    <View
      accessible
      accessibilityLabel={digits.join('')}
      style={styles.row}
    >
      {digits.map((digit, index) => (
        <RollingDigit
          key={digits.length - index}
          digit={Number(digit)}
          height={height}
          variant={variant}
          color={color}
        />
      ))}
    </View>
  );
}

function RollingDigit({
  digit,
  height,
  variant,
  color,
}: {
  digit: number;
  height: number;
  variant: TypographyVariant;
  color: TextProps['color'];
}) {
  const reducedMotion = useReducedMotion();
  const position = useSharedValue(digit);

  useEffect(() => {
    const current = position.value % 10;
    if (current === digit) {
      return;
    }
    if (reducedMotion) {
      position.value = digit;
      return;
    }
    // Always roll forward; a decrease (9 → 0) continues into the second copy, then snaps back.
    const target = digit < current ? digit + 10 : digit;
    position.value = withSpring(target, SPRING, (finished) => {
      if (finished) {
        position.value = target % 10;
      }
    });
  }, [digit, position, reducedMotion]);

  const columnStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -position.value * height }],
  }));

  return (
    <View style={{ height, overflow: 'hidden' }}>
      <Animated.View style={columnStyle}>
        {DIGITS.map((cell, index) => (
          <Text key={index} variant={variant} color={color} style={{ height }}>
            {cell}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
});
