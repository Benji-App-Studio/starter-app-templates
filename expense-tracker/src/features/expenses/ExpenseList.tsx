import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { Icon, Text } from '@/components';
import type { Expense } from '@/db/expenses';
import { useTheme } from '@/theme/theme';

import { categoryById } from './categories';
import { formatMoney } from './money';
import { dayLabel, startOfDay } from './period';

type ExpenseListProps = {
  expenses: Expense[];
  currency: string;
  onPress: (expense: Expense) => void;
};

type DayGroup = { key: number; label: string; totalCents: number; expenses: Expense[] };

function groupByDay(expenses: Expense[], now: number): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const expense of expenses) {
    const key = startOfDay(expense.spentAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.expenses.push(expense);
      last.totalCents += expense.amountCents;
    } else {
      groups.push({ key, label: dayLabel(expense.spentAt, now), totalCents: expense.amountCents, expenses: [expense] });
    }
  }
  return groups;
}

/** Expenses grouped by day, newest first, each day with its total. Rows open the edit sheet. */
export function ExpenseList({ expenses, currency, onPress }: ExpenseListProps) {
  const { colors, sizes, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const groups = groupByDay(expenses, Date.now());

  return (
    <Animated.View layout={reduceMotion ? undefined : LinearTransition} style={{ gap: spacing.lg }}>
      {groups.map((group) => (
        <View key={group.key}>
          <View style={[styles.dayHeader, { marginBottom: spacing.xs }]}>
            <Text variant="caption" color="muted">
              {group.label}
            </Text>
            <Text variant="caption" color="muted">
              {formatMoney(group.totalCents, currency)}
            </Text>
          </View>
          {group.expenses.map((expense) => (
            <Animated.View
              key={expense.id}
              entering={reduceMotion ? undefined : FadeInDown.springify().damping(18)}
              layout={reduceMotion ? undefined : LinearTransition}
            >
              <ExpenseRow expense={expense} currency={currency} onPress={() => onPress(expense)} />
              <View style={[styles.separator, { backgroundColor: colors.border, marginLeft: sizes.badge + spacing.md }]} />
            </Animated.View>
          ))}
        </View>
      ))}
    </Animated.View>
  );
}

type ExpenseRowProps = { expense: Expense; currency: string; onPress: () => void };

export function ExpenseRow({ expense, currency, onPress }: ExpenseRowProps) {
  const { colors, categoryTints, radii, sizes, spacing } = useTheme();
  const category = categoryById(expense.categoryId);
  const title = expense.note || category.label;
  const time = new Date(expense.spentAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const subtitle = expense.note ? category.label : time;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${formatMoney(expense.amountCents, currency)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { gap: spacing.md, paddingVertical: spacing.item, opacity: pressed ? 0.6 : 1 }]}
    >
      <View
        style={[
          styles.badge,
          { width: sizes.badge, height: sizes.badge, backgroundColor: categoryTints[category.tint], borderRadius: radii.pill },
        ]}
      >
        <Icon name={category.icon} size={18} color={colors.onTint} weight="semibold" />
      </View>
      <View style={[styles.body, { gap: spacing.hairline }]}>
        <Text variant="body" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="caption" color="muted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Text variant="money" numberOfLines={1}>{formatMoney(expense.amountCents, currency)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  badge: { alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0 },
  separator: { height: StyleSheet.hairlineWidth },
});
