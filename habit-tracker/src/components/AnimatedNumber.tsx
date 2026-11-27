import { useEffect } from 'react';
import { StyleSheet, TextInput, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme, type TypographyVariant } from '@/theme/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type AnimatedNumberProps = {
  value: number;
  variant?: TypographyVariant;
  color?: string;
  style?: TextStyle;
};

/**
 * A number that counts to its new value. Drawn with a read-only TextInput so the digits
 * change on the UI thread without a React render per frame.
 */
export function AnimatedNumber({ value, variant = 'numeral', color, style }: AnimatedNumberProps) {
  const { colors, typography } = useTheme();
  const reduceMotion = useReducedMotion();
  const animated = useSharedValue(value);

  useEffect(() => {
    animated.value = reduceMotion ? value : withSpring(value, { damping: 20, stiffness: 120 });
  }, [animated, reduceMotion, value]);

  const animatedProps = useAnimatedProps(() => ({
    text: String(Math.round(animated.value)),
    defaultValue: String(Math.round(animated.value)),
  }));

  return (
    <AnimatedTextInput
      accessibilityLabel={String(value)}
      editable={false}
      underlineColorAndroid="transparent"
      animatedProps={animatedProps}
      style={[typography[variant], styles.input, { color: color ?? colors.text }, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: { padding: 0, margin: 0, textAlign: 'center' },
});
