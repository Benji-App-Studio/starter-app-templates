import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { AnimatedNumber, Card, EmptyState, Icon, Row, Screen, Stack, Text } from '@/components';
import { useCollapsingTitle } from '@/components/CollapsingTitle';
import { deleteSession, listDailyTotals, listSessions, type DailyTotal, type Session } from '@/db/sessions';
import { useTheme } from '@/theme/theme';

import { useFocusSettings } from './focusSettings';
import { dayKey, formatDay, formatMinutes, formatTime, streakDays, totalsFor, weekMinutes } from './stats';
import { useTimer } from './timer';
import { WeekChart } from './WeekChart';

function formatCount(value: number) {
  'worklet';
  return String(value);
}

type DaySection = { key: string; title: string; minutes: number; data: Session[] };

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList<Session, DaySection>);

export function HistoryScreen() {
  const router = useRouter();
  const { onScroll, largeTitle, compactBar } = useCollapsingTitle('History');
  const { colors, spacing } = useTheme();
  const { settings } = useFocusSettings();
  const { state } = useTimer();
  const [sessions, setSessions] = useState<Session[]>();
  const [totals, setTotals] = useState<DailyTotal[]>([]);

  const refresh = useCallback(() => {
    void Promise.all([listSessions(), listDailyTotals()]).then(([rows, days]) => {
      setSessions(rows);
      setTotals(days);
    });
  }, []);

  useFocusEffect(refresh);
  useEffect(refresh, [refresh, state.status]);

  const today = new Date();
  const sections = groupByDay(sessions ?? [], today);

  function handleDelete(session: Session) {
    Alert.alert('Delete this session?', `${formatMinutes(session.minutes)} of ${session.label} will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void deleteSession(session.id).then(refresh),
      },
    ]);
  }

  if (!sessions) {
    return <Screen edges={['top']}>{null}</Screen>;
  }

  if (sessions.length === 0) {
    return (
      <Screen edges={['top']} title="History">
        <EmptyState
          illustration={<EmptyDial />}
          title="Nothing saved yet"
          body="Finish one session and it shows up here, with your day and week totals."
          action={{ title: 'Set the dial', onPress: () => router.navigate('/') }}
        />
      </Screen>
    );
  }

  const todayTotals = totalsFor(totals, today);
  const streak = streakDays(totals, today);
  const week = weekMinutes(totals, today);

  return (
    <Screen edges={['top']} contentStyle={styles.flush}>
      <View style={styles.flex}>
        <AnimatedSectionList
          sections={sections}
          keyExtractor={(session) => String(session.id)}
          contentInsetAdjustmentBehavior="automatic"
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          // The js tabBar sits below the list, not over it, so 32 pt is enough to finish clear of it.
          contentContainerStyle={{
            paddingHorizontal: spacing.gutter,
            paddingTop: spacing.md,
            paddingBottom: spacing.xl,
            gap: spacing.ms,
          }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <Stack gap="ms">
              {largeTitle}
              <Card style={{ padding: spacing.gutter }}>
                <Stack gap="md">
                  <Stack gap="xs">
                    <Text variant="eyebrow" color="muted">
                      FOCUSED THIS WEEK
                    </Text>
                    <AnimatedNumber value={week} format={formatMinutes} variant="numeralMedium" />
                  </Stack>
                  <WeekChart totals={totals} today={today} />
                </Stack>
              </Card>
              <Row gap="ms" align="stretch">
                <StatTile
                  caption="Today"
                  value={todayTotals.minutes}
                  format={formatMinutes}
                  detail={`${todayTotals.sessions} of ${settings.dailyGoal} sessions`}
                />
                <StatTile
                  caption="Streak"
                  value={streak}
                  format={formatCount}
                  detail={streak === 1 ? 'day in a row' : 'days in a row'}
                  icon="flame"
                />
              </Row>
            </Stack>
          }
          renderSectionHeader={({ section }) => (
            <Row justify="space-between" style={{ paddingTop: spacing.ms, paddingHorizontal: spacing.xs }}>
              <Text variant="eyebrow" color="muted">
                {section.title.toUpperCase()}
              </Text>
              <Text variant="caption" color="muted" style={styles.tabular}>
                {formatMinutes(section.minutes)}
              </Text>
            </Row>
          )}
          renderItem={({ item }) => (
            <Animated.View entering={FadeIn} exiting={FadeOut} layout={LinearTransition}>
              <Card>
                <Row gap="md">
                  <Stack gap="xs" style={styles.body}>
                    <Text variant="label" numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text variant="caption" color="muted" numberOfLines={1} style={styles.tabular}>
                      {formatTime(item.startedAt)} – {formatTime(item.endedAt)}
                    </Text>
                  </Stack>
                  <Row gap="xs" align="baseline">
                    <Text variant="numeralSmall" numberOfLines={1} style={styles.tabular}>
                      {item.minutes}
                    </Text>
                    <Text variant="caption" color="muted">
                      min
                    </Text>
                  </Row>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.label}`}
                    hitSlop={spacing.ms}
                    onPress={() => handleDelete(item)}
                    style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                  >
                    <Icon name="trash" size={18} color={colors.textMuted} />
                  </Pressable>
                </Row>
              </Card>
            </Animated.View>
          )}
        />
        {compactBar}
      </View>
    </Screen>
  );
}

function groupByDay(sessions: Session[], today: Date): DaySection[] {
  const byDay = new Map<string, Session[]>();
  for (const session of sessions) {
    const key = dayKey(new Date(session.endedAt));
    byDay.set(key, [...(byDay.get(key) ?? []), session]);
  }
  return [...byDay.entries()].map(([key, data]) => ({
    key,
    title: formatDay(key, today),
    minutes: data.reduce((sum, session) => sum + session.minutes, 0),
    data,
  }));
}

type StatTileProps = {
  caption: string;
  value: number;
  format: (value: number) => string;
  detail?: string;
  icon?: 'flame';
};

function StatTile({ caption, value, format, detail, icon }: StatTileProps) {
  const { colors } = useTheme();

  return (
    <Card style={styles.tile}>
      <Stack gap="xs">
        <Row gap="xs">
          {icon ? (
            <Icon name={icon} size={12} color={value > 0 ? colors.primary : colors.textMuted} weight="semibold" />
          ) : null}
          <Text variant="eyebrow" color="muted">
            {caption.toUpperCase()}
          </Text>
        </Row>
        <AnimatedNumber value={value} format={format} variant="numeralSmall" />
        {detail ? (
          <Text variant="caption" color="muted" numberOfLines={1}>
            {detail}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}

/** A small dial at zero, for the empty history. */
function EmptyDial() {
  const { colors } = useTheme();

  return (
    <Svg width={120} height={120} accessibilityLabel="An empty dial">
      <Circle cx={60} cy={60} r={52} fill={colors.surface} stroke={colors.border} strokeWidth={2} />
      {Array.from({ length: 12 }, (_, index) => {
        const rad = (index * 30 * Math.PI) / 180;
        return (
          <Circle
            key={index}
            cx={60 + 44 * Math.sin(rad)}
            cy={60 - 44 * Math.cos(rad)}
            r={index === 0 ? 3 : 2}
            fill={index === 0 ? colors.primary : colors.border}
          />
        );
      })}
      <Path d="M 60 60 L 60 22 A 38 38 0 0 1 79 27 Z" fill={colors.primarySoft} />
      <Circle cx={60} cy={60} r={6} fill={colors.primary} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  flush: { paddingHorizontal: 0, paddingTop: 0 },
  flex: { flex: 1 },
  tile: { flex: 1 },
  body: { flex: 1, minWidth: 0 },
  tabular: { fontVariant: ['tabular-nums'] },
});
