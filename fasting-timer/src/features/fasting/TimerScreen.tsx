import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Button, Icon, Row, Screen, Stack, Text } from '@/components';
import { useTheme } from '@/theme/theme';

import { changeProtocol, endFast, startFast } from './actions';
import { FastingRing } from './FastingRing';
import { HoldButton } from './HoldButton';
import { usePreferences } from './preferences';
import { ProtocolPicker } from './ProtocolPicker';
import { getProtocol } from './protocols';
import { computeStreaks, fastDuration, goalMs, isGoalReached } from './stats';
import { HOUR_MS, formatClock, formatDay, formatDuration, formatTime, nextOccurrence } from './time';
import { useFasting } from './useFasting';

/** The home tab: the ring, the plan, and the one action that fits the moment. */
export function TimerScreen() {
  const router = useRouter();
  const { colors, spacing, radii } = useTheme();
  const { width } = useWindowDimensions();
  const prefs = usePreferences();
  const { active, fasts, now, refresh } = useFasting();
  const [heroHeight, setHeroHeight] = useState(0);

  if (active === undefined || fasts === undefined) {
    return <Screen edges={['top']}>{null}</Screen>;
  }

  const protocol = getProtocol(active?.protocolId ?? prefs.protocolId);
  const elapsed = active ? fastDuration(active, now) : 0;
  const progress = active ? elapsed / goalMs(active) : 0;
  const reached = active ? isGoalReached(active, now) : false;
  const streak = computeStreaks(fasts, now).current;
  // The ring takes all the height the hero area has, up to the screen width minus the gutters.
  const ringSize = Math.max(0, Math.min(width - spacing.gutter * 2, heroHeight));
  const usualStart = nextOccurrence(prefs.startHour, prefs.startMinute, now);

  async function handleStart() {
    await startFast(prefs.protocolId);
    refresh();
  }

  function handleEnd() {
    if (!active) return;
    const finish = async () => {
      await endFast(active);
      refresh();
    };
    if (reached) {
      void finish();
      return;
    }
    Alert.alert(
      'End the fast early?',
      `You are ${formatDuration(elapsed)} in, ${formatDuration(goalMs(active) - elapsed)} short of ${active.goalHours} hours. It is saved either way.`,
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'End fast', style: 'destructive', onPress: () => void finish() },
      ],
    );
  }

  const dateLabel = new Date(now).toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Screen
      edges={['top']}
      contentStyle={styles.content}
      footer={
        <Animated.View layout={LinearTransition} style={{ gap: spacing.sm }}>
          {active ? (
            <Animated.View key="end" entering={FadeIn} exiting={FadeOut} style={{ gap: spacing.sm }}>
              <Button
                title={reached ? 'End fast' : 'End fast early'}
                variant={reached ? 'primary' : 'secondary'}
                onPress={handleEnd}
              />
              <Button title="Edit start time" variant="ghost" onPress={() => router.push(`/fast/${active.id}`)} />
            </Animated.View>
          ) : (
            <Animated.View key="start" entering={FadeIn} exiting={FadeOut} style={{ gap: spacing.sm }}>
              <HoldButton title={`Start a ${protocol.fastHours}-hour fast`} onCommit={() => void handleStart()} />
              {prefs.endAlert ? (
                // Same height as the Settings link, so the ring does not resize when the alert is turned on.
                <View style={styles.nudge}>
                  <Text variant="caption" color="muted" align="center">
                    You will get an alert when it ends
                  </Text>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/settings')}
                  style={styles.nudge}
                  hitSlop={8}
                >
                  <Text variant="caption" color="muted" align="center">
                    Get an alert when the fast ends · Settings
                  </Text>
                </Pressable>
              )}
            </Animated.View>
          )}
        </Animated.View>
      }
    >
      <Stack gap="md" fill>
        <Row justify="space-between" style={[styles.topRow, { paddingHorizontal: spacing.gutter }]}>
          <Text variant="caption" color="muted" numberOfLines={1}>
            {dateLabel}
          </Text>
          {streak > 0 ? (
            <Row
              gap="sm"
              accessibilityLabel={`${streak} day streak`}
              style={[
                styles.streak,
                { backgroundColor: colors.surface, borderRadius: radii.pill, paddingHorizontal: spacing.ms },
              ]}
            >
              <Icon name="flame" size={14} color={colors.gold} />
              <Text variant="caption" style={styles.tabular}>
                {streak} day{streak === 1 ? '' : 's'}
              </Text>
            </Row>
          ) : null}
        </Row>

        <View style={styles.hero} onLayout={(event) => setHeroHeight(Math.floor(event.nativeEvent.layout.height))}>
          {ringSize > 0 ? (
            <FastingRing
              size={ringSize}
              progress={progress}
              goalHours={protocol.fastHours}
              reached={reached}
              idle={!active}
            >
              {active ? (
                <>
                  <Text variant="label" color={reached ? 'gold' : 'muted'}>
                    {reached ? 'Goal reached' : `Hour ${Math.floor(elapsed / HOUR_MS) + 1}`}
                  </Text>
                  <Text variant="numeral" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    {formatClock(elapsed)}
                  </Text>
                  <Text variant="caption" color="muted" numberOfLines={1}>
                    {reached
                      ? `${formatDuration(elapsed - goalMs(active))} past ${active.goalHours} hours`
                      : `${formatDuration(goalMs(active) - elapsed)} to go`}
                  </Text>
                </>
              ) : (
                <>
                  <Text variant="label" color="muted">
                    Ready
                  </Text>
                  <Text variant="numeral" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    {protocol.id}
                  </Text>
                  <Text variant="caption" color="muted" numberOfLines={1}>
                    {protocol.fastHours} hours fasting · {protocol.eatHours} eating
                  </Text>
                </>
              )}
            </FastingRing>
          ) : null}
        </View>

        <Row gap="md" align="flex-start" style={{ paddingHorizontal: spacing.gutter }}>
          {active ? (
            <>
              <Fact label="Started" value={formatTime(active.startedAt)} detail={formatDay(active.startedAt, now)} />
              <Fact
                label="Goal"
                value={formatTime(active.startedAt + goalMs(active))}
                detail={formatDay(active.startedAt + goalMs(active), now)}
                highlight={reached}
              />
            </>
          ) : (
            <>
              <Fact label="Usual start" value={formatTime(usualStart)} detail={formatDay(usualStart, now)} />
              <Fact
                label="If you start now"
                value={formatTime(now + protocol.fastHours * HOUR_MS)}
                detail={formatDay(now + protocol.fastHours * HOUR_MS, now)}
              />
            </>
          )}
        </Row>

        <ProtocolPicker value={protocol.id} onChange={(id) => void changeProtocol(id, active).then(refresh)} />
      </Stack>
    </Screen>
  );
}

function Fact({
  label,
  value,
  detail,
  highlight = false,
}: {
  label: string;
  value: string;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <Stack gap="sm" fill>
      <Text variant="caption" color="muted" numberOfLines={1}>
        {label}
      </Text>
      <Text
        variant="heading"
        color={highlight ? 'gold' : 'text'}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={styles.tabular}
      >
        {value}
      </Text>
      <Text variant="caption" color="muted" numberOfLines={1}>
        {detail}
      </Text>
    </Stack>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 0 },
  topRow: { minHeight: 32 },
  streak: { height: 32 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabular: { fontVariant: ['tabular-nums'] },
  nudge: { minHeight: 44, justifyContent: 'center' },
});
