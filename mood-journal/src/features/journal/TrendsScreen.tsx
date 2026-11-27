import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AnimatedNumber, Card, Chip, EmptyState, Row, Screen, Section, Stack, Text } from '@/components';
import { listTagStats, type TagStat } from '@/db/checkInTags';
import { listCheckIns, listCheckInDays, type CheckIn } from '@/db/checkIns';
import { useTheme } from '@/theme/theme';

import { addDays, todayKey } from './dates';
import { EmptyTrend } from './Illustrations';
import { MoodFace } from './MoodFace';
import { MOOD_SCORES, moodColor, moodFor, progressForScore, scoreForAverage } from './moods';
import { currentStreak, longestStreak } from './streak';
import { TrendLine, type TrendPoint } from './TrendLine';

type Range = { id: 'week' | 'month' | 'quarter'; label: string; days: number };

const RANGES: Range[] = [
  { id: 'week', label: '7 days', days: 7 },
  { id: 'month', label: '30 days', days: 30 },
  { id: 'quarter', label: '90 days', days: 90 },
];

type Loaded = {
  checkIns: CheckIn[];
  tagStats: TagStat[];
  streak: number;
  best: number;
};

function buildPoints(checkIns: CheckIn[], range: Range, today: string): TrendPoint[] {
  const byDay = new Map(checkIns.map((checkIn) => [checkIn.day, checkIn.score]));
  const days = Array.from({ length: range.days }, (_, index) => addDays(today, index - range.days + 1));
  if (range.id !== 'quarter') {
    return days.map((day) => ({ day, score: byDay.get(day) }));
  }
  // Ninety days read better as weekly means, labelled by the week's last day.
  const weeks: TrendPoint[] = [];
  for (let start = 0; start < days.length; start += 7) {
    const week = days.slice(start, start + 7);
    const scores = week.flatMap((day) => byDay.get(day) ?? []);
    weeks.push({
      day: week[week.length - 1],
      score: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : undefined,
    });
  }
  return weeks;
}

/** What the days add up to: the line, the mix of moods, and which tags travel with the good days. */
export function TrendsScreen() {
  const { colors, radii, spacing } = useTheme();
  const router = useRouter();
  const today = todayKey();
  const [range, setRange] = useState<Range>(RANGES[1]);
  const [loaded, setLoaded] = useState<Loaded>();

  const load = useCallback(async () => {
    const from = addDays(today, -(range.days - 1));
    const [checkIns, tagStats, days] = await Promise.all([
      listCheckIns(from, today),
      listTagStats(from, today),
      listCheckInDays(),
    ]);
    setLoaded({
      checkIns,
      tagStats,
      streak: currentStreak(new Set(days), today),
      best: longestStreak(days),
    });
  }, [range.days, today]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const rangeChips = (
    <Row gap="sm">
      {RANGES.map((option) => (
        <Chip
          key={option.id}
          label={option.label}
          selected={option.id === range.id}
          onPress={() => setRange(option)}
          tone="ink"
        />
      ))}
    </Row>
  );

  if (loaded === undefined) {
    return (
      <Screen tab title="Trends">
        {rangeChips}
      </Screen>
    );
  }

  if (loaded.checkIns.length < 2) {
    return (
      <Screen tab title="Trends">
        {rangeChips}
        <EmptyState
          illustration={<EmptyTrend />}
          title="Two days make a line"
          body={`Check in on a couple more days and the last ${range.label} draw themselves here.`}
          action={{ title: 'Check in today', onPress: () => router.navigate('/') }}
        />
      </Screen>
    );
  }

  const { checkIns, tagStats } = loaded;
  const average = checkIns.reduce((sum, checkIn) => sum + checkIn.score, 0) / checkIns.length;
  const averageScore = scoreForAverage(average);
  const counts = MOOD_SCORES.map((score) => checkIns.filter((checkIn) => checkIn.score === score).length);
  const maxCount = Math.max(...counts, 1);
  const frequent = tagStats.filter((stat) => stat.count >= 2);
  const lifts = [...frequent].sort((a, b) => b.averageScore - a.averageScore).slice(0, 3);
  const weighs = [...frequent].sort((a, b) => a.averageScore - b.averageScore).slice(0, 3);

  return (
    <Screen tab title="Trends" eyebrow={`${checkIns.length} of the last ${range.days} days`}>
      {rangeChips}

      <Animated.View key={range.id} entering={FadeIn.duration(220)}>
        <Stack gap="ms">
          <Card style={{ paddingHorizontal: spacing.sm }}>
            <TrendLine points={buildPoints(checkIns, range, today)} today={today} />
          </Card>
          <Row gap="ms" align="stretch">
            <Card style={styles.tile}>
              <Stack gap="xs">
                <MoodFace progress={progressForScore(averageScore)} size={40} />
                <Text variant="heading" numberOfLines={1}>
                  {moodFor(averageScore).label}
                </Text>
                <Text variant="caption" color="muted" numberOfLines={1}>
                  {`Average ${average.toFixed(1)} of 5`}
                </Text>
              </Stack>
            </Card>
            <Card style={styles.tile}>
              <Stack gap="xs">
                <AnimatedNumber value={loaded.streak} variant="stat" />
                <Text variant="caption" color="muted" numberOfLines={1}>
                  {loaded.streak === 1 ? 'day in a row' : 'days in a row'}
                </Text>
                <Text variant="caption" color="muted" numberOfLines={1}>
                  {`Best ${loaded.best}`}
                </Text>
              </Stack>
            </Card>
          </Row>
        </Stack>
      </Animated.View>

      <Section title="The mix">
        <Card style={{ gap: spacing.ms }}>
          {MOOD_SCORES.map((score, index) => (
            <View key={score} style={[styles.row, { gap: spacing.sm }]}>
              <Text variant="caption" color="muted" numberOfLines={1} style={styles.mixLabel}>
                {moodFor(score).label}
              </Text>
              <View style={[styles.track, { backgroundColor: colors.background, borderRadius: radii.pill }]}>
                <Animated.View
                  key={`${range.id}-${counts[index]}`}
                  entering={FadeIn.duration(300)}
                  style={{
                    width: `${Math.max(4, (counts[index] / maxCount) * 100)}%`,
                    height: '100%',
                    borderRadius: radii.pill,
                    backgroundColor: moodColor(colors, score),
                    opacity: counts[index] === 0 ? 0.25 : 1,
                  }}
                />
              </View>
              <Text variant="caption" style={styles.mixCount}>
                {counts[index]}
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="What travels with your days">
        {frequent.length > 0 ? (
          <Row gap="ms" align="stretch">
            <TagColumn title="Lifts you" stats={lifts} />
            <TagColumn title="Weighs on you" stats={weighs} />
          </Row>
        ) : (
          <Text variant="caption" color="muted">
            Tag a few more days and this shows what lifts you and what weighs on you.
          </Text>
        )}
      </Section>
    </Screen>
  );
}

function TagColumn({ title, stats }: { title: string; stats: TagStat[] }) {
  const { spacing } = useTheme();
  return (
    <Card style={[styles.tile, { gap: spacing.ms }]}>
      <Text variant="label" numberOfLines={1}>
        {title}
      </Text>
      {stats.map((stat) => (
        <View key={stat.tag} style={[styles.row, { gap: spacing.sm }]}>
          <MoodFace progress={progressForScore(scoreForAverage(stat.averageScore))} size={22} />
          <Text variant="body" style={styles.flex} numberOfLines={1}>
            {stat.tag}
          </Text>
          <Text variant="caption" color="muted">
            {`×${stat.count}`}
          </Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1, minWidth: 0 },
  tile: { flex: 1, minWidth: 0 },
  track: { flex: 1, height: 12, overflow: 'hidden' },
  mixLabel: { width: 48 },
  mixCount: { width: 24, textAlign: 'right' },
});
