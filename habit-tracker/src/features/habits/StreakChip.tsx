import { StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components';
import { useTheme } from '@/theme/theme';

type StreakChipProps = {
  days: number;
  /** What the streak counts, e.g. "perfect days". Defaults to "day streak". */
  noun?: string;
};

/** A warm pill with a flame: the one place the streak color appears. */
export function StreakChip({ days, noun }: StreakChipProps) {
  const { colors, radii, spacing } = useTheme();
  const label = noun ? `${days} ${noun}` : `${days}-day streak`;

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: colors.streakSoft,
          borderRadius: radii.pill,
          paddingHorizontal: spacing.item,
          paddingVertical: spacing.xs + spacing.xxs,
          gap: spacing.sm,
        },
      ]}
    >
      <Icon name="flame" size={14} color={colors.streak} weight="bold" />
      <Text variant="caption" style={{ color: colors.streak, fontVariant: ['tabular-nums'] }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center' },
});
