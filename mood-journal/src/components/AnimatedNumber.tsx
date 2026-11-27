import { useEffect } from 'react';
import { TextInput, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
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
  style?: StyleProp<TextStyle>;
};

/** A number that counts up to its new value with a spring. Tabular digits keep it steady. */
export function AnimatedNumber({ value, variant = 'numeral', color, style }: AnimatedNumberProps) {
  const { colors, typography } = useTheme();
  const reducedMotion = useReducedMotion();
  const current = useSharedValue(value);

  useEffect(() => {
    current.value = reducedMotion ? value : withSpring(value, { damping: 20, stiffness: 90 });
  }, [current, reducedMotion, value]);

  const text = useDerivedValue(() => String(Math.round(current.value)));
  const animatedProps = useAnimatedProps(() => ({ text: text.value, defaultValue: text.value }));

  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      animatedProps={animatedProps}
      style={[typography[variant], { color: color ?? colors.text, padding: 0 }, style]}
    />
  );
}
