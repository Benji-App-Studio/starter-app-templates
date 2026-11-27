import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type StepperProps = {
  value: number;
  /** The formatted value shown between the buttons. */
  label: string;
  step: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

export function Stepper({ value, label, step, min, max, onChange }: StepperProps) {
  const { colors, radii } = useTheme();

  function change(direction: -1 | 1) {
    const next = Math.min(max, Math.max(min, Math.round((value + direction * step) * 100) / 100));
    if (next !== value) {
      void Haptics.selectionAsync();
      onChange(next);
    }
  }

  return (
    <View style={[styles.row, { backgroundColor: colors.surfaceAlt, borderRadius: radii.sm }]}>
      <StepButton icon="minus" disabled={value <= min} onPress={() => change(-1)} />
      <Text variant="label" tabular align="center" style={styles.value}>
        {label}
      </Text>
      <StepButton icon="plus" disabled={value >= max} onPress={() => change(1)} />
    </View>
  );
}

function StepButton({
  icon,
  disabled,
  onPress,
}: {
  icon: 'plus' | 'minus';
  disabled: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={icon === 'plus' ? 'Increase' : 'Decrease'}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.button, { opacity: disabled ? 0.3 : pressed ? 0.5 : 1 }]}
    >
      <Icon name={icon} size={16} color={colors.primary} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  button: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 64 },
});
