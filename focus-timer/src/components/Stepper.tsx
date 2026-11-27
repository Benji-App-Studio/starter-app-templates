import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Shown after the number, e.g. "min". */
  unit?: string;
  accessibilityLabel: string;
};

/** A compact minus / value / plus control for settings rows. */
export function Stepper({ value, onChange, min, max, step = 1, unit, accessibilityLabel }: StepperProps) {
  const { colors, radii, spacing } = useTheme();

  function change(delta: number) {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) {
      void Haptics.selectionAsync();
      onChange(next);
    }
  }

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value, text: unit ? `${value} ${unit}` : String(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => change(event.nativeEvent.actionName === 'increment' ? step : -step)}
      style={[styles.root, { padding: spacing.xs, backgroundColor: colors.surfaceStrong, borderRadius: radii.pill }]}
    >
      <StepButton icon="minus" disabled={value <= min} onPress={() => change(-step)} />
      <View style={[styles.value, { paddingHorizontal: spacing.xs }]}>
        <Text variant="label" numberOfLines={1} style={{ fontVariant: ['tabular-nums'] }}>
          {value}
          {unit ? <Text variant="caption" color="muted">{` ${unit}`}</Text> : null}
        </Text>
      </View>
      <StepButton icon="plus" disabled={value >= max} onPress={() => change(step)} />
    </View>
  );
}

function StepButton({ icon, disabled, onPress }: { icon: 'minus' | 'plus'; disabled: boolean; onPress: () => void }) {
  const { colors, radii, sizes } = useTheme();

  return (
    <Pressable
      accessibilityElementsHidden
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { width: sizes.chip, height: sizes.chip, borderRadius: radii.pill, opacity: disabled ? 0.3 : pressed ? 0.5 : 1 },
      ]}
    >
      <Icon name={icon} size={15} color={colors.text} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center' },
  button: { alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 56, alignItems: 'center' },
});
