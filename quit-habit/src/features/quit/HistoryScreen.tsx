import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card, EmptyState, Icon, Row, Screen, Section, Stack, Text } from '@/components';
import { listAttempts, type Attempt } from '@/db/attempts';
import { countCravings, listCravingsSince, type Craving } from '@/db/cravings';
import { useTheme } from '@/theme/theme';

import { CravingsChart, type DayCount } from './CravingsChart';
import { QuietBarsIllustration } from './Illustrations';
import { formatUnits, habits, triggerLabel } from './habits';
import { formatMoney, useProfile } from './profile';
import { attemptSavings, totalSavings } from './savings';
import { DAY_MS, formatDate, formatDateTime, formatDuration, formatDurationShort, splitDuration } from './time';

const CHART_DAYS = 7;

type HistoryData = {
  attempts: Attempt[];
  recentCravings: Craving[];
  totalCravings: number;
};

/** Every attempt so far, the week's cravings, and the totals across all of them. */
export function HistoryScreen() {
  const router = useRouter();
  const { colors, radii, spacing, typography } = useTheme();
  const profile = useProfile();
  const [data, setData] = useState<HistoryData>();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        const since = startOfDay(Date.now()) - (CHART_DAYS - 1) * DAY_MS;
        const [attempts, recentCravings, totalCravings] = await Promise.all([
          listAttempts(),
          listCravingsSince(since),
          countCravings(),
        ]);
        if (!cancelled) {
          setData({ attempts, recentCravings, totalCravings });
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  if (!data || !profile) {
    return <Screen tab title="History">{null}</Screen>;
  }

  if (data.attempts.length === 0) {
    return (
      <Screen tab title="History" contentStyle={styles.center}>
        <EmptyState
          illustration={<QuietBarsIllustration />}
          title="Nothing to look back on yet"
          body="Your attempts, the cravings you get through and the totals across all of them will collect here."
          action={{ title: 'Start my counter', onPress: () => router.push('/start') }}
        />
      </Screen>
    );
  }

  const now = Date.now();
  const habit = habits[profile.habit];
  const totals = totalSavings(data.attempts, now);
  const longest = Math.max(...data.attempts.map((attempt) => attemptSavings(attempt, now).elapsedMs));
  const days = cravingsPerDay(data.recentCravings, now);
  const totalFree = bigDuration(totals.elapsedMs);

  return (
    <Screen tab title="History">
      <Stack gap="xl">
        <Stack gap="lg">
          <Stack gap="xs">
            <Text variant="overline" color="primary">
              TIME FREE IN ALL
            </Text>
            <Row gap="sm" align="baseline">
              <Text variant="numeral" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} style={styles.shrink}>
                {totalFree.value}
              </Text>
              <Text variant="heading" color="muted">
                {totalFree.unit}
              </Text>
            </Row>
            <Text variant="caption" color="muted">
              Across {data.attempts.length} {data.attempts.length === 1 ? 'attempt' : 'attempts'}, slips included.
            </Text>
          </Stack>
          <Row gap="item" align="stretch">
            <Total label="Longest run" value={formatDurationShort(longest)} />
            <Total label="Kept in all" value={formatMoney(totals.money, profile.currency, 0)} />
            {/* The number alone keeps the three totals the same size; the unit moves into the caption. */}
            <Total
              label={`${habit.unit.many.charAt(0).toUpperCase()}${habit.unit.many.slice(1)} ${habit.avoidedLabel}`}
              value={Math.floor(totals.units).toLocaleString()}
            />
          </Row>
        </Stack>

        <Section title="Cravings, last 7 days" accessory={`${data.totalCravings} beaten in all`} card>
          <CravingsChart days={days} />
        </Section>

        <Section title="Attempts" accessory={`${data.attempts.length} so far`} card>
          {data.attempts.map((attempt, index) => {
            const savings = attemptSavings(attempt, now);
            const isCurrent = attempt.endedAt === null;
            return (
              <Animated.View
                key={attempt.id}
                entering={FadeInDown.delay(index * 40).springify().damping(18)}
                style={[
                  styles.attempt,
                  {
                    gap: spacing.item,
                    paddingTop: index === 0 ? 0 : spacing.item,
                    paddingBottom: index === data.attempts.length - 1 ? 0 : spacing.item,
                    borderTopColor: colors.border,
                    borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <View style={[styles.dotSlot, { height: typography.label.lineHeight }]}>
                  <View style={[styles.dot, { backgroundColor: isCurrent ? colors.primary : colors.border, borderRadius: radii.pill }]} />
                </View>
                <Stack gap="xxs" style={styles.grow}>
                  <Row gap="sm" justify="space-between">
                    <Text variant="label" tabular numberOfLines={1} style={styles.shrink}>
                      {formatDuration(savings.elapsedMs)}
                    </Text>
                    {isCurrent ? (
                      <View style={[styles.pill, { backgroundColor: colors.primarySoft, borderRadius: radii.pill, paddingHorizontal: spacing.item, paddingVertical: spacing.sm }]}>
                        <Text variant="overline" color="primary">
                          NOW
                        </Text>
                      </View>
                    ) : null}
                  </Row>
                  <Text variant="caption" color="muted">
                    {formatDateTime(attempt.startedAt)}
                    {attempt.endedAt ? ` to ${formatDate(attempt.endedAt)}` : ''} · {formatMoney(savings.money, profile.currency, 0)} · {formatUnits(savings.units, habit)}
                  </Text>
                  {attempt.note ? (
                    <Row gap="xs" align="flex-start">
                      <Icon name="note" size={13} color={colors.textMuted} />
                      <Text variant="caption" color="muted" numberOfLines={2} style={styles.grow}>
                        {attempt.note}
                      </Text>
                    </Row>
                  ) : null}
                </Stack>
              </Animated.View>
            );
          })}
        </Section>

        {data.recentCravings.length > 0 ? (
          <Section title="Recent cravings" card>
            {data.recentCravings.slice(0, 8).map((craving, index, list) => (
              <View
                key={craving.id}
                style={[
                  styles.craving,
                  {
                    gap: spacing.sm,
                    paddingTop: index === 0 ? 0 : spacing.item,
                    paddingBottom: index === list.length - 1 ? 0 : spacing.item,
                    borderTopColor: colors.border,
                    borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <Text variant="body" numberOfLines={1} style={styles.grow}>
                  {triggerLabel(craving.trigger) ?? 'Craving'}
                </Text>
                <Text variant="caption" color="muted" numberOfLines={1}>
                  {craving.breathingSeconds > 0 ? `${Math.round(craving.breathingSeconds / 60) || 1} min breathing · ` : ''}
                  {formatDateTime(craving.createdAt)}
                </Text>
              </View>
            ))}
          </Section>
        ) : null}
      </Stack>
    </Screen>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.total}>
      <Stack gap="xxs">
        <Text variant="heading" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {value}
        </Text>
        <Text variant="caption" color="muted" numberOfLines={2}>
          {label}
        </Text>
      </Stack>
    </Card>
  );
}

/** Whole days once there is a day to count, hours before that. */
function bigDuration(ms: number): { value: string; unit: string } {
  const { days, hours } = splitDuration(ms);
  if (days >= 1) {
    return { value: String(days), unit: days === 1 ? 'day' : 'days' };
  }
  return { value: String(hours), unit: hours === 1 ? 'hour' : 'hours' };
}

function startOfDay(ms: number): number {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function cravingsPerDay(cravings: Craving[], now: number): DayCount[] {
  const today = startOfDay(now);
  return Array.from({ length: CHART_DAYS }, (_, index) => {
    const dayStart = today - (CHART_DAYS - 1 - index) * DAY_MS;
    const count = cravings.filter((craving) => craving.createdAt >= dayStart && craving.createdAt < dayStart + DAY_MS).length;
    return {
      label: new Date(dayStart).toLocaleDateString(undefined, { weekday: 'narrow' }),
      count,
      isToday: index === CHART_DAYS - 1,
    };
  });
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  total: { flex: 1, minWidth: 0 },
  attempt: { flexDirection: 'row', alignItems: 'flex-start' },
  dotSlot: { justifyContent: 'center' },
  dot: { width: 10, height: 10 },
  pill: { alignSelf: 'center' },
  grow: { flex: 1, minWidth: 0 },
  shrink: { flexShrink: 1, minWidth: 0 },
  craving: { flexDirection: 'row', alignItems: 'center' },
});
