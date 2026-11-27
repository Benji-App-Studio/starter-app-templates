import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Card, Chip, CountUp, EmptyState, NightIllustration, Screen, Text } from '@/components';
import { deleteSession, listSessions, rateSession, type Rating, type Session } from '@/db/sessions';
import { formatDuration, formatNight } from '@/features/mixer/format';
import { soundById } from '@/features/mixer/sounds';
import { spacing, useTheme } from '@/theme/theme';

import { NightsChart, type NightBar } from './NightsChart';

const RATINGS: { id: Rating; label: string }[] = [
  { id: 'rough', label: 'Rough' },
  { id: 'okay', label: 'Okay' },
  { id: 'rested', label: 'Rested' },
];

const DAY_MS = 86_400_000;

/** The evening a timestamp belongs to; anything before 6 am counts as the night before. */
function nightOf(timestamp: number): number {
  const shifted = new Date(timestamp - 6 * 3600_000);
  return new Date(shifted.getFullYear(), shifted.getMonth(), shifted.getDate()).getTime();
}

function lastSevenNights(sessions: Session[]): NightBar[] {
  const tonight = nightOf(Date.now());
  return Array.from({ length: 7 }, (_, index) => {
    const night = tonight - (6 - index) * DAY_MS;
    const minutes = sessions
      .filter((session) => nightOf(session.startedAt) === night)
      .reduce((sum, session) => sum + (session.endedAt - session.startedAt) / 60_000, 0);
    return {
      label: new Date(night).toLocaleDateString(undefined, { weekday: 'short' }),
      minutes: Math.round(minutes),
      isTonight: night === tonight,
    };
  });
}

/** The sleep log: this week's bars, two numbers, and every night with how it went. */
export function NightsScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const [sessions, setSessions] = useState<Session[]>();

  useFocusEffect(
    useCallback(() => {
      listSessions().then(setSessions);
    }, []),
  );

  async function handleRate(session: Session, rating: Rating) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await rateSession(session.id, rating);
    setSessions((current) => current?.map((entry) => (entry.id === session.id ? { ...entry, rating } : entry)));
  }

  function handleDelete(session: Session) {
    Alert.alert('Remove this night?', 'It will disappear from the log and the chart.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteSession(session.id);
          setSessions((current) => current?.filter((entry) => entry.id !== session.id));
        },
      },
    ]);
  }

  if (!sessions) {
    return <Screen edges={['top']} title="Nights">{null}</Screen>;
  }

  if (sessions.length === 0) {
    return (
      <Screen scroll tabs edges={['top']} title="Nights" contentStyle={styles.grow}>
        <EmptyState
          illustration={<NightIllustration kind="log" />}
          title="No nights logged yet"
          body="Press play tonight. When the mix stops, the night lands here with how long it played."
          action={{ title: 'Open the mixer', onPress: () => router.navigate('/') }}
        />
      </Screen>
    );
  }

  const bars = lastSevenNights(sessions);
  const weekNights = bars.filter((bar) => bar.minutes > 0).length;
  const weekMinutes = bars.reduce((sum, bar) => sum + bar.minutes, 0);
  const averageMinutes = weekNights > 0 ? Math.round(weekMinutes / weekNights) : 0;
  const restedShare = sessions.filter((session) => session.rating !== null).length;
  const rested = sessions.filter((session) => session.rating === 'rested').length;

  return (
    <Screen scroll tabs edges={['top']} title="Nights" contentStyle={{ gap: spacing.item }}>
      <View style={[styles.stats, { gap: spacing.sm }]}>
        <Stat value={weekNights} label={weekNights === 1 ? 'night this week' : 'nights this week'} />
        <Stat value={averageMinutes} format={(m) => formatDuration(m * 60_000)} label="average night" />
        <Stat
          value={restedShare > 0 ? Math.round((rested / restedShare) * 100) : 0}
          format={(v) => (restedShare > 0 ? `${v}%` : '—')}
          label="woke up rested"
        />
      </View>

      <Card>
        <Text variant="label" color="muted" style={{ marginBottom: spacing.sm }}>
          Listening, last 7 nights
        </Text>
        <NightsChart bars={bars} />
      </Card>

      <Text variant="heading" style={{ marginTop: spacing.md }}>
        Every night
      </Text>
      {sessions.map((session, index) => (
        <Animated.View
          key={session.id}
          entering={FadeInDown.delay(Math.min(index, 8) * 40).springify().damping(18)}
          exiting={FadeOut}
          layout={LinearTransition.springify().damping(18)}
        >
          <Card onLongPress={() => handleDelete(session)}>
            <View style={styles.sessionRow}>
              <View style={styles.sessionBody}>
                <Text variant="label">{formatNight(session.startedAt)}</Text>
                <Text variant="caption" color="muted" numberOfLines={1}>
                  {session.sounds.map((entry) => soundById[entry.id].name).join(' · ')}
                </Text>
              </View>
              <Text variant="label" tabular>
                {formatDuration(session.endedAt - session.startedAt)}
              </Text>
            </View>
            {session.rating === null ? (
              <View style={[styles.rating, { gap: spacing.sm, marginTop: spacing.md }]}>
                <Text variant="caption" color="muted" style={styles.ratingLabel}>
                  How was the night?
                </Text>
                {RATINGS.map((rating) => (
                  <Chip
                    key={rating.id}
                    label={rating.label}
                    selected={false}
                    onPress={() => handleRate(session, rating.id)}
                  />
                ))}
              </View>
            ) : (
              <Text variant="caption" color={session.rating === 'rested' ? 'success' : 'muted'} style={{ marginTop: spacing.xs }}>
                {RATINGS.find((rating) => rating.id === session.rating)?.label}
              </Text>
            )}
          </Card>
        </Animated.View>
      ))}
      <Text variant="caption" color="muted" align="center" style={{ marginTop: spacing.sm }}>
        Hold a night to remove it.
      </Text>
    </Screen>
  );
}

function Stat({
  value,
  label,
  format,
}: {
  value: number;
  label: string;
  format?: (value: number) => string;
}) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      style={[
        styles.stat,
        { backgroundColor: colors.surface, borderRadius: radii.lg, borderCurve: 'continuous', padding: spacing.md },
      ]}
    >
      <CountUp value={value} format={format} variant="title" />
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grow: { flexGrow: 1 },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, gap: spacing.sm },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.item },
  sessionBody: { flex: 1, gap: spacing.sm },
  rating: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  ratingLabel: { flex: 1, minWidth: 110 },
});
