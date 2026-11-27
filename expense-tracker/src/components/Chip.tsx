import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
  /** Dot drawn before the label, e.g. a category tint. */
  tint?: string;
};

/** A pill for single-choice strips: categories, days, currencies. */
export function Chip({ label, selected, onPress, icon, tint }: ChipProps) {
  const { colors, radii, spacing } = useTheme();
  const foreground = selected ? colors.onPrimary : colors.text;

  function handlePress() {
    void Haptics.selectionAsync();
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.md,
          gap: spacing.sm,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {icon ? <Icon name={icon} size={16} color={foreground} weight="semibold" /> : null}
      {tint && !icon ? (
        <View style={[styles.dot, { backgroundColor: tint, borderRadius: radii.pill }]} />
      ) : null}
      <Text variant="label" color={selected ? 'onPrimary' : 'text'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  dot: { width: 10, height: 10 },
});
