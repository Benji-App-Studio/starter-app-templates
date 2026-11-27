import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { Row, Stack } from '@/components/Layout';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | 'backspace';

type KeypadProps = {
  onKey: (key: KeypadKey) => void;
  /** Long-pressing backspace clears the whole amount. */
  onClear: () => void;
};

const ROWS: KeypadKey[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'backspace'],
];

const PRESSED_SCALE = 0.92;
const KEY_SPRING = { damping: 14, stiffness: 420, mass: 0.6 };

/** The in-app numeric keypad. No system keyboard, so the sheet never jumps. */
export function Keypad({ onKey, onClear }: KeypadProps) {
  return (
    <Stack gap="sm">
      {ROWS.map((row) => (
        <Row key={row.join()} gap="sm">
          {row.map((key) => (
            <Key key={key} value={key} onPress={() => onKey(key)} onLongPress={key === 'backspace' ? onClear : undefined} />
          ))}
        </Row>
      ))}
    </Stack>
  );
}

type KeyProps = { value: KeypadKey; onPress: () => void; onLongPress?: () => void };

/** One key: it dips on touch and springs back, with a light tick on every press. */
function Key({ value, onPress, onLongPress }: KeyProps) {
  const { colors, radii, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: pressed.value ? colors.track : colors.background,
  }));

  function pressIn() {
    pressed.value = 1;
    if (!reduceMotion) {
      scale.value = withSpring(PRESSED_SCALE, KEY_SPRING);
    }
  }

  function pressOut() {
    pressed.value = 0;
    scale.value = reduceMotion ? 1 : withSpring(1, KEY_SPRING);
  }

  function press() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  function longPress() {
    if (onLongPress) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value === 'backspace' ? 'Delete' : value === '.' ? 'Decimal point' : value}
      accessibilityHint={value === 'backspace' ? 'Hold to clear the amount' : undefined}
      onPress={press}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onLongPress={onLongPress ? longPress : undefined}
      style={styles.slot}
    >
      <Animated.View style={[styles.key, { height: sizes.key, borderRadius: radii.md }, animatedStyle]}>
        {value === 'backspace' ? (
          <Icon name="backspace" size={24} color={colors.text} />
        ) : (
          <Text variant="key">{value}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1 },
  key: { alignItems: 'center', justifyContent: 'center' },
});
