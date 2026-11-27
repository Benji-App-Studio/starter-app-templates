import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type StepperProps = {
  /** Already formatted, e.g. "2,000" or "1.5". */
  value: string;
  label: string;
  onDecrement: () => void;
  onIncrement: () => void;
  canDecrement?: boolean;
  canIncrement?: boolean;
};

export function Stepper({
  value,
  label,
  onDecrement,
  onIncrement,
  canDecrement = true,
  canIncrement = true,
}: StepperProps) {
  const { colors, radii, spacing } = useTheme();

  function step(change: () => void) {
    void Haptics.selectionAsync();
    change();
  }

  const buttonStyle = {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.pill,
  };

  return (
    <View accessibilityLabel={label} accessibilityValue={{ text: value }} style={[styles.row, { gap: spacing.sm }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        disabled={!canDecrement}
        hitSlop={6}
        onPress={() => step(onDecrement)}
        style={({ pressed }) => [styles.button, buttonStyle, { opacity: !canDecrement ? 0.35 : pressed ? 0.6 : 1 }]}
      >
        <Icon name="minus" size={16} color={colors.text} weight="semibold" />
      </Pressable>
      <Text variant="label" style={[styles.value, { fontVariant: ['tabular-nums'] }]} align="center">
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        disabled={!canIncrement}
        hitSlop={6}
        onPress={() => step(onIncrement)}
        style={({ pressed }) => [styles.button, buttonStyle, { opacity: !canIncrement ? 0.35 : pressed ? 0.6 : 1 }]}
      >
        <Icon name="add" size={16} color={colors.text} weight="semibold" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  button: {
    width: 36,
    height: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { minWidth: 52 },
});
