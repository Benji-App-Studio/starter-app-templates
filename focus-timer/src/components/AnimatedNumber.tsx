import { useEffect } from 'react';
import { TextInput, type TextStyle, type StyleProp } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme, type TypographyVariant } from '@/theme/theme';

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type AnimatedNumberProps = {
  value: number;
  /** Turns the animated value into the string shown, e.g. minutes → "1h 20m". Must be a worklet. */
  format: (value: number) => string;
  variant?: TypographyVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
};

/**
 * A number that counts to its new value instead of jumping. Rendered through a
 * read-only TextInput so the text can change on the UI thread each frame.
 */
export function AnimatedNumber({ value, format, variant = 'numeralSmall', color, style }: AnimatedNumberProps) {
  const { colors, typography } = useTheme();
  const reducedMotion = useReducedMotion();
  const shown = useSharedValue(value);

  useEffect(() => {
    shown.value = reducedMotion
      ? value
      : withTiming(value, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [value, reducedMotion, shown]);

  const animatedProps = useAnimatedProps(() => ({
    text: format(Math.round(shown.value)),
    defaultValue: format(Math.round(shown.value)),
  }));

  return (
    <AnimatedTextInput
      accessibilityLabel={format(value)}
      animatedProps={animatedProps}
      editable={false}
      underlineColorAndroid="transparent"
      style={[typography[variant], { color: color ?? colors.text, padding: 0 }, style]}
    />
  );
}
