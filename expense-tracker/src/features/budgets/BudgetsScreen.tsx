import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Icon, MeterBar, Row, Screen, Stack, Text } from '@/components';
import { AnimatedMoney } from '@/features/expenses/AnimatedMoney';
import { categories, type Category } from '@/features/expenses/categories';
import { useBudgetPeriod, usePeriodSummary, type PeriodSummary } from '@/features/expenses/data';
import { formatMoney } from '@/features/expenses/money';
import { periodLabel } from '@/features/expenses/period';
import { usePreferences } from '@/features/expenses/preferences';
import { useTheme } from '@/theme/theme';

import { CategoryRing } from './CategoryRing';

const MAX_RING_SIZE = 280;

export function BudgetsScreen() {
  const router = useRouter();
  const { categoryTints, colors, radii, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const { currency } = usePreferences();
  const period = useBudgetPeriod();
  const summary = usePeriodSummary(period);
  const ringSize = Math.min(width - spacing.gutter * 2, MAX_RING_SIZE);
  const over = summary !== undefined && summary.budgetCents > 0 && summary.spentCents > summary.budgetCents;

  function openEditor(categoryId: string) {
    router.push({ pathname: '/budget', params: { categoryId } });
  }

  return (
    <Screen
      title="Budgets"
      subtitle={
        summary
          ? `${periodLabel(period)} · ${formatMoney(summary.budgetCents, currency)} ${summary.firstDayIndex > 0 ? 'this month' : 'a month'}`
          : undefined
      }
      edges={['top']}
    >
      {summary ? (
        <Stack gap="xl">
          <Stack gap="md" align="center">
            <CategoryRing
              size={ringSize}
              segments={categories.map((category) => ({
                id: category.id,
                color: categoryTints[category.tint],
                limitCents: summary.limits[category.id] ?? 0,
                spentCents: summary.spentByCategory[category.id] ?? 0,
              }))}
            >
              <Stack gap="xs" align="center">
                <Text variant="eyebrow" color="muted">
                  SPENT SO FAR
                </Text>
                <AnimatedMoney
                  cents={summary.spentCents}
                  currency={currency}
                  variant="display"
                  color={over ? 'danger' : 'text'}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                />
                <Text variant="caption" color="muted" numberOfLines={1}>
                  of {formatMoney(summary.budgetCents, currency)}
                </Text>
              </Stack>
            </CategoryRing>
            <Text variant="caption" color="muted" align="center">
              Each arc is a category’s limit. Tap a category to change it.
            </Text>
          </Stack>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: radii.lg,
              paddingHorizontal: spacing.md,
            }}
          >
            {categories.map((category, index) => (
              <View key={category.id}>
                {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                <BudgetRow
                  category={category}
                  summary={summary}
                  currency={currency}
                  onPress={() => openEditor(category.id)}
                />
              </View>
            ))}
          </View>
        </Stack>
      ) : null}
    </Screen>
  );
}

type BudgetRowProps = {
  category: Category;
  summary: PeriodSummary;
  currency: string;
  onPress: () => void;
};

function BudgetRow({ category, summary, currency, onPress }: BudgetRowProps) {
  const { colors, categoryTints, radii, sizes, spacing } = useTheme();
  const tint = categoryTints[category.tint];
  const spent = summary.spentByCategory[category.id] ?? 0;
  const limit = summary.limits[category.id] ?? 0;
  const hasLimit = limit > 0;
  const over = hasLimit && spent > limit;

  let status: { text: string; color: 'text' | 'muted' | 'danger' };
  if (!hasLimit) {
    status = { text: 'Set a limit', color: 'muted' };
  } else if (over) {
    status = { text: `${formatMoney(spent - limit, currency)} over`, color: 'danger' };
  } else {
    status = { text: `${formatMoney(limit - spent, currency)} left`, color: 'text' };
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${category.label}, ${status.text}`}
      onPress={onPress}
      style={({ pressed }) => [{ paddingVertical: spacing.md, gap: spacing.item, opacity: pressed ? 0.6 : 1 }]}
    >
      <Row gap="item">
        <View
          style={[
            styles.badge,
            { width: sizes.badge, height: sizes.badge, backgroundColor: tint, borderRadius: radii.pill },
          ]}
        >
          <Icon name={category.icon} size={18} color={colors.onTint} weight="semibold" />
        </View>
        <Stack gap="hairline" style={styles.body}>
          <Text variant="label" numberOfLines={1}>
            {category.label}
          </Text>
          <Text variant="caption" color="muted" numberOfLines={1}>
            {hasLimit
              ? `${formatMoney(spent, currency)} of ${formatMoney(limit, currency)}`
              : `${formatMoney(spent, currency)} spent`}
          </Text>
        </Stack>
        <Text variant={hasLimit ? 'money' : 'label'} color={status.color} numberOfLines={1}>
          {status.text}
        </Text>
      </Row>
      <MeterBar progress={hasLimit ? spent / limit : 0} color={over ? colors.danger : tint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0 },
  divider: { height: StyleSheet.hairlineWidth },
});
