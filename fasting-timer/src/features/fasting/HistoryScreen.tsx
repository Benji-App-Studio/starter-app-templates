import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import {
  Card,
  CompactHeader,
  EmptyState,
  Icon,
  LargeTitle,
  Row,
  Screen,
  Stack,
  Text,
  useCollapsingTitle,
} from '@/components';
import type { Fast } from '@/db/fasts';
import { spacing, useTheme } from '@/theme/theme';

import { EmptyArt } from './EmptyArt';
import { usePreferences } from './preferences';
import { getProtocol } from './protocols';
import { computeStreaks, computeTotals, fastDuration, isGoalReached, weeklyHours } from './stats';
import { formatDay, formatDuration, formatTime } from './time';
import { useFasting } from './useFasting';
import { WeekChart } from './WeekChart';

const TITLE = 'History';

/** Streaks and the week at the top, every saved fast below. */
export function HistoryScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const prefs = usePreferences();
  const { active, fasts, now } = useFasting();
  const { offset, scrollHandler } = useCollapsingTitle();

  if (fasts === undefined || active === undefined) {
    return <Screen edges={['top']}>{null}</Screen>;
  }

  const goalHours = getProtocol(active?.protocolId ?? prefs.protocolId).fastHours;

  if (fasts.length === 0) {
    return (
      <Screen edges={['top']}>
        <Text variant="title">{TITLE}</Text>
        <EmptyState
          illustration={<EmptyArt />}
          title={active ? 'Your first fast is running' : 'No fasts yet'}
          body={
            active
              ? 'It lands here when you end it. Fasts you did before the app can be logged too.'
              : 'Hold the ring on the timer to start one, or log a fast you already did.'
          }
          action={{ title: 'Log a past fast', onPress: () => router.push('/fast/new') }}
        />
      </Screen>
    );
  }

  const streaks = computeStreaks(fasts, now);
  const totals = computeTotals(fasts, now);
  const week = weeklyHours(fasts, active, now);

  return (
    <Screen edges={['top']} contentStyle={styles.content}>
      <CompactHeader title={TITLE} offset={offset} />
      <Animated.FlatList
        data={fasts}
        keyExtractor={(fast) => String(fast.id)}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        itemLayoutAnimation={LinearTransition}
        contentContainerStyle={{
          paddingHorizontal: spacing.gutter,
          paddingTop: spacing.md,
          gap: spacing.ms,
          paddingBottom: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Stack gap="lg">
            <Stack gap="ms">
              <LargeTitle title={TITLE} offset={offset} />
              <Row gap="sm" align="stretch">
                <Stat icon="flame" value={streaks.current} label="day streak" accent={streaks.current > 0} />
                <Stat icon="trophy" value={streaks.longest} label="longest" />
                <Stat icon="check" value={totals.completed} label={`of ${totals.count} done`} />
              </Row>
              <Card>
                <Stack gap="md">
                  <Row gap="sm" justify="space-between">
                    <Text variant="label" numberOfLines={1}>
                      Last 7 days
                    </Text>
                    <Text variant="caption" color="muted" numberOfLines={1} style={styles.tabular}>
                      avg {formatDuration(totals.averageHours * 3_600_000)} · goal {goalHours}h
                    </Text>
                  </Row>
                  <WeekChart days={week} goalHours={goalHours} />
                </Stack>
              </Card>
            </Stack>
            <Row gap="sm" justify="space-between">
              <Text variant="caption" color="muted">
                ALL FASTS
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/fast/new')}
                hitSlop={8}
                style={styles.logLink}
              >
                <Icon name="plus" size={13} color={colors.primary} weight="semibold" />
                <Text variant="caption" color="primary">
                  Log a past fast
                </Text>
              </Pressable>
            </Row>
          </Stack>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).springify().damping(18)}>
            <FastRow fast={item} now={now} onPress={() => router.push(`/fast/${item.id}`)} />
          </Animated.View>
        )}
      />
    </Screen>
  );
}

function Stat({
  icon,
  value,
  label,
  accent = false,
}: {
  icon: 'flame' | 'trophy' | 'check';
  value: number;
  label: string;
  accent?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Card style={styles.stat}>
      <Stack gap="sm">
        <Icon name={icon} size={16} color={accent ? colors.gold : colors.textMuted} />
        <Text variant="stat" color={accent ? 'gold' : 'text'} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {value}
        </Text>
        <Text variant="caption" color="muted" numberOfLines={1}>
          {label}
        </Text>
      </Stack>
    </Card>
  );
}

function FastRow({ fast, now, onPress }: { fast: Fast; now: number; onPress: () => void }) {
  const { colors } = useTheme();
  const reached = isGoalReached(fast, now);
  const endedAt = fast.endedAt ?? now;

  return (
    <Card onPress={onPress} style={styles.row}>
      <View style={[styles.rowBadge, { backgroundColor: reached ? colors.goldSoft : colors.surfaceRaised }]}>
        <Icon name={reached ? 'check' : 'timer'} size={18} color={reached ? colors.gold : colors.textMuted} />
      </View>
      <Stack gap="xs" fill>
        <Row gap="sm">
          <Text variant="label" numberOfLines={1} style={styles.tabular}>
            {formatDuration(fastDuration(fast, now))}
          </Text>
          <Text variant="caption" color="muted" numberOfLines={1}>
            {fast.protocolId} plan
          </Text>
        </Row>
        <Text variant="caption" color="muted" numberOfLines={1}>
          {formatDay(fast.startedAt, now)} {formatTime(fast.startedAt)} – {formatTime(endedAt)}
        </Text>
      </Stack>
      <Text variant="caption" color={reached ? 'gold' : 'muted'}>
        {reached ? 'Goal' : `${formatDuration(fast.goalHours * 3_600_000 - fastDuration(fast, now))} short`}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 0, paddingVertical: 0 },
  stat: { flex: 1 },
  logLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.ms },
  rowBadge: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabular: { fontVariant: ['tabular-nums'] },
});
