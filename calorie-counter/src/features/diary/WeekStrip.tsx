import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components';
import { useTheme } from '@/theme/theme';

import { dayOfMonth, weekdayInitial } from './days';

const RING_SIZE = 38;
const RING_STROKE = 3.5;

type WeekStripProps = {
  /** Monday to Sunday. */
  days: string[];
  today: string;
  /** Calories eaten per day key; days without logs are absent. */
  caloriesByDay: Record<string, number>;
  target: number;
  onSelect: (day: string) => void;
};

/** The week at a glance: a tiny ring per day, today marked, future days quiet. */
export function WeekStrip({ days, today, caloriesByDay, target, onSelect }: WeekStripProps) {
  const { colors, spacing } = useTheme();
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={[styles.row, { gap: spacing.xs }]}>
      {days.map((day) => {
        const isToday = day === today;
        const isFuture = day > today;
        const calories = caloriesByDay[day] ?? 0;
        const progress = Math.min(calories / target, 1);
        const over = calories > target;
        const ringColor = over ? colors.danger : colors.primary;

        return (
          <Pressable
            key={day}
            accessibilityRole="button"
            accessibilityLabel={`${weekdayInitial(day)} ${dayOfMonth(day)}, ${Math.round(calories)} calories`}
            accessibilityState={{ selected: isToday, disabled: isFuture }}
            disabled={isFuture}
            onPress={() => {
              void Haptics.selectionAsync();
              onSelect(day);
            }}
            style={({ pressed }) => [styles.cell, { gap: spacing.xs, opacity: isFuture ? 0.35 : pressed ? 0.6 : 1 }]}
          >
            <Text variant="caption" color={isToday ? 'primary' : 'muted'}>
              {weekdayInitial(day)}
            </Text>
            <View style={styles.ring}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={radius}
                  stroke={isToday ? colors.primarySoft : colors.border}
                  strokeWidth={RING_STROKE}
                  fill={isToday ? colors.primarySoft : 'none'}
                />
                {progress > 0 ? (
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={radius}
                    stroke={ringColor}
                    strokeWidth={RING_STROKE}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={circumference * (1 - progress)}
                    transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  />
                ) : null}
              </Svg>
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <View style={styles.center}>
                  <Text variant="micro" color={isToday ? 'primary' : 'text'}>
                    {dayOfMonth(day)}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { flex: 1, alignItems: 'center', minHeight: 44 },
  ring: { width: RING_SIZE, height: RING_SIZE },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
