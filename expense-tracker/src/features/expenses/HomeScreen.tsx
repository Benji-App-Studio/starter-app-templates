import { useRouter } from 'expo-router';

import { Button, EmptyState, Row, Screen, Stack, Text } from '@/components';

import { AllowanceHero } from './AllowanceHero';
import { useBudgetPeriod, usePeriodSummary } from './data';
import { ExpenseList } from './ExpenseList';
import { EmptyLedgerIllustration } from './illustrations';
import { dayIndex, daysLeft, periodEdgeLabels, periodLabel } from './period';
import { usePreferences } from './preferences';

export function HomeScreen() {
  const router = useRouter();
  const { currency } = usePreferences();
  const period = useBudgetPeriod();
  const summary = usePeriodSummary(period);
  const now = Date.now();
  const remaining = daysLeft(period, now);
  const subtitle = remaining === 1 ? 'Last day of the month' : `${remaining} days left`;
  const [startLabel, endLabel] = periodEdgeLabels(period);

  function openExpense(id?: number) {
    router.push(id === undefined ? '/expense' : { pathname: '/expense', params: { id: String(id) } });
  }

  return (
    <Screen
      title={periodLabel(period)}
      subtitle={subtitle}
      edges={['top']}
      footer={<Button title="Add expense" icon="plus" onPress={() => openExpense()} />}
    >
      {summary ? (
        <Stack gap="xl">
          <AllowanceHero
            spentCents={summary.spentCents}
            budgetCents={summary.budgetCents}
            firstDayIndex={summary.firstDayIndex}
            spentByDay={summary.spentByDay}
            todayIndex={dayIndex(period, now)}
            daysLeft={remaining}
            startLabel={startLabel}
            endLabel={endLabel}
            currency={currency}
          />

          {summary.expenses.length === 0 ? (
            <EmptyState
              illustration={<EmptyLedgerIllustration />}
              title="Nothing logged yet"
              // No action of its own: the pinned "Add expense" button sits right under it.
              body="Add what you spend as it happens. The number above drops with every entry."
            />
          ) : (
            <Stack gap="item">
              <Row justify="space-between" align="baseline">
                <Text variant="heading">Spending</Text>
                <Text variant="caption" color="muted">
                  {summary.expenses.length === 1 ? '1 expense' : `${summary.expenses.length} expenses`}
                </Text>
              </Row>
              <ExpenseList
                expenses={summary.expenses}
                currency={currency}
                onPress={(expense) => openExpense(expense.id)}
              />
            </Stack>
          )}
        </Stack>
      ) : null}
    </Screen>
  );
}
