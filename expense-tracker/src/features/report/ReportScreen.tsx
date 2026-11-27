import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState, MeterBar, Row, Screen, Stack, Text } from '@/components';
import { categories } from '@/features/expenses/categories';
import { useBudgetPeriod, useHasExpenses, usePeriodHistory, usePeriodSummary } from '@/features/expenses/data';
import { ExpenseList } from '@/features/expenses/ExpenseList';
import { EmptyChartIllustration } from '@/features/expenses/illustrations';
import { formatMoney } from '@/features/expenses/money';
import { periodLabel } from '@/features/expenses/period';
import { usePreferences } from '@/features/expenses/preferences';
import { useTheme } from '@/theme/theme';

import { PeriodChart } from './PeriodChart';

const MONTHS_SHOWN = 6;

export function ReportScreen() {
  const router = useRouter();
  const { categoryTints, radii } = useTheme();
  const { currency } = usePreferences();
  const current = useBudgetPeriod();
  const history = usePeriodHistory(current, MONTHS_SHOWN);
  const hasExpenses = useHasExpenses();
  const [selectedIndex, setSelectedIndex] = useState(MONTHS_SHOWN - 1);
  const selectedPeriod = history?.[selectedIndex]?.period ?? current;
  const summary = usePeriodSummary(selectedPeriod);
  const loaded = history !== undefined && summary !== undefined && hasExpenses !== undefined;

  const breakdown = categories
    .map((category) => ({ category, cents: summary?.spentByCategory[category.id] ?? 0 }))
    .filter((item) => item.cents > 0)
    .sort((a, b) => b.cents - a.cents);
  const difference = summary ? summary.budgetCents - summary.spentCents : 0;

  return (
    <Screen title="Report" subtitle={loaded ? periodLabel(selectedPeriod) : undefined} edges={['top']}>
      {loaded ? (
        hasExpenses ? (
          <Stack gap="xl">
            <Stack gap="md">
              <PeriodChart
                history={history}
                budgetCents={summary.budgetCents}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
                currency={currency}
              />
              {summary.budgetCents > 0 ? (
                <Text color={difference < 0 ? 'danger' : 'muted'}>
                  {difference < 0
                    ? `${formatMoney(-difference, currency)} over the ${formatMoney(summary.budgetCents, currency)} budget`
                    : `${formatMoney(difference, currency)} under the ${formatMoney(summary.budgetCents, currency)} budget`}
                </Text>
              ) : null}
            </Stack>

            {breakdown.length > 0 ? (
              <Stack gap="item">
                <Text variant="heading">By category</Text>
                <Stack gap="md">
                  {breakdown.map(({ category, cents }) => (
                    <Stack key={category.id} gap="xs">
                      <Row gap="sm">
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: categoryTints[category.tint], borderRadius: radii.pill },
                          ]}
                        />
                        <Text variant="label" numberOfLines={1} style={styles.grow}>
                          {category.label}
                        </Text>
                        <Text variant="caption" color="muted">
                          {Math.round((cents / summary.spentCents) * 100)}%
                        </Text>
                        <Text variant="money" numberOfLines={1} style={styles.amount}>
                          {formatMoney(cents, currency)}
                        </Text>
                      </Row>
                      <MeterBar progress={cents / summary.spentCents} color={categoryTints[category.tint]} height={4} />
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            ) : (
              <Text color="muted">Nothing was logged in {periodLabel(selectedPeriod)}.</Text>
            )}

            {summary.expenses.length > 0 ? (
              <Stack gap="item">
                <Text variant="heading">Every expense</Text>
                <ExpenseList
                  expenses={summary.expenses}
                  currency={currency}
                  onPress={(expense) => router.push({ pathname: '/expense', params: { id: String(expense.id) } })}
                />
              </Stack>
            ) : null}
          </Stack>
        ) : (
          <EmptyState
            illustration={<EmptyChartIllustration />}
            title="No report yet"
            body="Log an expense and this month appears here, with the five before it."
            action={{ title: 'Add an expense', onPress: () => router.push('/expense') }}
          />
        )
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  dot: { width: 10, height: 10 },
  grow: { flex: 1, minWidth: 0 },
  amount: { minWidth: 72, textAlign: 'right' },
});
