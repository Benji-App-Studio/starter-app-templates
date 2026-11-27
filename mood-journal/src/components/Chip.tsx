import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/icons';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** 'accent' fills with the primary (or `color`) when selected; 'ink' fills with the text color, for segmented choices. */
  tone?: 'accent' | 'ink';
  /** Fill color when selected, for chips that carry a mood color. */
  color?: string;
  icon?: IconName;
};

/** A pill toggle for tags and small choices. */
export function Chip({ label, selected = false, onPress, tone = 'accent', color, icon }: ChipProps) {
  const { colors, radii, spacing, layout } = useTheme();
  const fill = tone === 'ink' ? colors.text : (color ?? colors.primary);
  const labelColor = tone === 'ink' ? colors.background : colors.onPrimary;

  function handlePress() {
    void Haptics.selectionAsync();
    onPress?.();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      disabled={!onPress}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? fill : colors.surface,
          borderColor: selected ? fill : colors.border,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          gap: spacing.sm,
          borderWidth: layout.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {icon ? <Icon name={icon} size={16} color={selected ? labelColor : colors.textMuted} /> : null}
      <Text variant="label" numberOfLines={1} style={{ color: selected ? labelColor : colors.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
