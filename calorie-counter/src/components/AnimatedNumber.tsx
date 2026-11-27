import { useEffect } from 'react';
import { StyleSheet, TextInput, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme, type TypographyVariant } from '@/theme/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type AnimatedNumberProps = {
  value: number;
  variant?: TypographyVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
};

function formatInteger(value: number): string {
  'worklet';
  const rounded = Math.round(Math.abs(value));
  const digits = String(rounded);
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return value < 0 ? `-${grouped}` : grouped;
}

/**
 * A number that counts to its new value with a spring. Rendered through a
 * read-only TextInput so the text updates on the UI thread without re-renders.
 */
export function AnimatedNumber({ value, variant = 'numeral', color, style }: AnimatedNumberProps) {
  const { colors, typography } = useTheme();
  const reduceMotion = useReducedMotion();
  const shown = useSharedValue(value);

  useEffect(() => {
    shown.value = reduceMotion
      ? withTiming(value, { duration: 150 })
      : withSpring(value, { damping: 26, stiffness: 120, mass: 1 });
  }, [reduceMotion, shown, value]);

  const animatedProps = useAnimatedProps(() => {
    const text = formatInteger(shown.value);
    return { text, defaultValue: text };
  });

  return (
    <AnimatedTextInput
      accessibilityLabel={formatInteger(value)}
      animatedProps={animatedProps}
      editable={false}
      maxFontSizeMultiplier={1.3}
      pointerEvents="none"
      underlineColorAndroid="transparent"
      style={[styles.input, typography[variant], { color: color ?? colors.text }, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: { padding: 0, margin: 0, textAlign: 'center' },
});
