import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type StepperProps = {
  label: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  /** Spoken as "Earlier day" / "Later day", for example. */
  unit: string;
  style?: StyleProp<ViewStyle>;
};

/** A labelled value with minus and plus. Used to set times without the system picker. */
export function Stepper({ label, value, onDecrement, onIncrement, unit, style }: StepperProps) {
  const { colors, radii, spacing } = useTheme();

  function step(direction: -1 | 1) {
    void Haptics.selectionAsync();
    (direction < 0 ? onDecrement : onIncrement)();
  }

  return (
    <View style={[{ gap: spacing.sm }, style]}>
      <Text variant="caption" color="muted">
        {label}
      </Text>
      <View
        style={[
          styles.row,
          { backgroundColor: colors.surfaceRaised, borderRadius: radii.md },
        ]}
      >
        <StepButton icon="minus" label={`Earlier ${unit}`} onPress={() => step(-1)} />
        <Text
          variant="label"
          align="center"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={[styles.value, { fontVariant: ['tabular-nums'] }]}
        >
          {value}
        </Text>
        <StepButton icon="plus" label={`Later ${unit}`} onPress={() => step(1)} />
      </View>
    </View>
  );
}

function StepButton({
  icon,
  label,
  onPress,
}: {
  icon: 'minus' | 'plus';
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}
    >
      <Icon name={icon} size={16} color={colors.text} weight="semibold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', height: 48 },
  button: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' },
  value: { flex: 1, minWidth: 0 },
});
