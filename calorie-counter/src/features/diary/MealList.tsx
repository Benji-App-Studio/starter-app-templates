import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeIn, FadeInDown, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { Icon, Text } from '@/components';
import type { FoodLog, Meal } from '@/db/foodLogs';
import { spacing as grid, useTheme } from '@/theme/theme';

import { MEALS } from './meals';
import { formatKcal } from './totals';

const DELETE_WIDTH = 80;

type MealListProps = {
  logs: FoodLog[];
  onAdd: (meal: Meal) => void;
  onDelete: (log: FoodLog) => void;
};

function formatServings(log: FoodLog): string {
  if (log.servings === 1) {
    return '1 serving';
  }
  return `${log.servings} servings`;
}

function LogRow({ log, onDelete, last }: { log: FoodLog; onDelete: (log: FoodLog) => void; last: boolean }) {
  const { colors, spacing } = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View
      entering={reduceMotion ? FadeIn : FadeInDown.springify().damping(18)}
      layout={LinearTransition.springify().damping(18)}
    >
      <ReanimatedSwipeable
        friction={2}
        rightThreshold={DELETE_WIDTH / 2}
        overshootRight={false}
        renderRightActions={(_progress, _translation, methods) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${log.name}`}
            onPress={() => {
              methods.close();
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onDelete(log);
            }}
            style={[styles.delete, { backgroundColor: colors.danger, width: DELETE_WIDTH }]}
          >
            <Icon name="trash" size={20} color={colors.onPrimary} />
          </Pressable>
        )}
      >
        <View
          style={[
            styles.row,
            {
              backgroundColor: colors.surface,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.ms,
              gap: spacing.md,
              borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.body}>
            <Text variant="label" numberOfLines={1}>
              {log.name}
            </Text>
            <Text variant="caption" color="muted" numberOfLines={1}>
              {formatServings(log)} · P {Math.round(log.protein)} · C {Math.round(log.carbs)} · F {Math.round(log.fat)}
            </Text>
          </View>
          <Text variant="label" style={styles.tabular}>
            {formatKcal(log.calories)}
          </Text>
        </View>
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

/** The day's food grouped by meal. Swipe a row left to delete it. */
export function MealList({ logs, onAdd, onDelete }: MealListProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.lg }}>
      {MEALS.map((meal) => {
        const mealLogs = logs.filter((log) => log.meal === meal.id);
        const total = mealLogs.reduce((sum, log) => sum + log.calories, 0);

        return (
          <View key={meal.id} style={{ gap: spacing.ms }}>
            <View style={[styles.header, { gap: spacing.sm }]}>
              <Text variant="heading" style={styles.title}>
                {meal.label}
              </Text>
              {mealLogs.length > 0 ? (
                <Text variant="caption" color="muted" style={styles.tabular}>
                  {formatKcal(total)} kcal
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Add to ${meal.label.toLowerCase()}`}
                hitSlop={8}
                onPress={() => onAdd(meal.id)}
                style={({ pressed }) => [
                  styles.add,
                  { backgroundColor: colors.primarySoft, borderRadius: radii.pill, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Icon name="add" size={16} color={colors.primary} weight="bold" />
              </Pressable>
            </View>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
              }}
            >
              {mealLogs.length === 0 ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onAdd(meal.id)}
                  style={({ pressed }) => [
                    styles.row,
                    { paddingHorizontal: spacing.md, paddingVertical: spacing.md, opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <Text variant="body" color="muted">
                    Nothing logged yet
                  </Text>
                </Pressable>
              ) : (
                mealLogs.map((log, index) => (
                  <LogRow key={log.id} log={log} onDelete={onDelete} last={index === mealLogs.length - 1} />
                ))
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1 },
  add: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  body: { flex: 1, minWidth: 0, gap: grid.xs },
  tabular: { fontVariant: ['tabular-nums'] },
  delete: { alignItems: 'center', justifyContent: 'center' },
});
