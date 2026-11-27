import { StyleSheet, View } from 'react-native';

import type { Habit } from '@/db/habits';
import { useTheme } from '@/theme/theme';

import { addDays, dayKey } from './dates';
import { isScheduled } from './streaks';

type WeekDotsProps = {
  habit: Habit;
  done: Set<string>;
  today: Date;
};

/** The last seven days as dots: filled when done, hollow when missed, faint when not due. */
export function WeekDots({ habit, done, today }: WeekDotsProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.row, { gap: spacing.xs }]}>
      {Array.from({ length: 7 }, (_, index) => {
        const date = addDays(today, index - 6);
        const scheduled = isScheduled(habit, date);
        const checked = done.has(dayKey(date));
        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: checked ? colors.primary : scheduled ? 'transparent' : colors.border,
                borderColor: checked ? colors.primary : scheduled ? colors.textMuted : colors.border,
                opacity: scheduled || checked ? 1 : 0.5,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
});
