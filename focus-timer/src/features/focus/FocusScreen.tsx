import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedNumber, Button, Icon, Row, Screen, Stack, Text } from '@/components';
import { listDailyTotals, listRecentLabels, type DailyTotal } from '@/db/sessions';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { Dial } from './Dial';
import { useFocusSettings } from './focusSettings';
import { GoalDots } from './GoalDots';
import { suggestedLabels } from './labels';
import { formatClock, formatMinutes, formatTime, streakDays, totalsFor } from './stats';
import { remainingMs, timer, useTimer, type TimerState } from './timer';

const FALLBACK_LABEL = 'Focus';
const DIAL_MAX_SIZE = 340;

function formatCount(value: number) {
  'worklet';
  return String(value);
}

export function FocusScreen() {
  const { colors, radii, sizes, spacing, typography } = useTheme();
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const { onboardingAnswers } = useAppState();
  const { settings, hydrated: settingsReady } = useFocusSettings();
  const { state, hydrated: timerReady } = useTimer();

  const [minutes, setMinutes] = useState<number>();
  const [label, setLabel] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [totals, setTotals] = useState<DailyTotal[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    void timer.hydrate();
  }, []);

  // The dial starts on the default length once it is known.
  useEffect(() => {
    if (settingsReady && minutes === undefined) {
      setMinutes(settings.focusMinutes);
    }
  }, [settingsReady, settings.focusMinutes, minutes]);

  const refresh = useCallback(() => {
    void listDailyTotals().then(setTotals);
    void listRecentLabels(4).then(setRecent);
  }, []);

  useFocusEffect(refresh);
  useEffect(refresh, [refresh, state.status]);

  const counting = state.status === 'running';
  useEffect(() => {
    if (!counting) {
      return;
    }
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [counting]);

  const inSession = state.status === 'running' || state.status === 'paused';
  // The dial is the hero: as wide as the gutters allow, but never more than ~42% of the height.
  const dialSize = Math.round(Math.min(width - spacing.gutter * 2, height * 0.42, DIAL_MAX_SIZE));

  // The commit moment of a session: it finished (on screen, or while the phone was down).
  const status = state.status;
  useEffect(() => {
    if (status === 'done') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [status]);

  const focusTint = useDerivedValue(
    () => withTiming(inSession ? 1 : 0, { duration: reducedMotion ? 0 : 600 }),
    [inSession, reducedMotion],
  );
  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(focusTint.value, [0, 1], [colors.background, colors.backgroundFocus]),
  }));

  const today = new Date(counting ? now : Date.now());
  const todayTotals = totalsFor(totals, today);
  const streak = streakDays(totals, today);
  const suggestions = suggestedLabels(onboardingAnswers.purpose, recent);

  if (!settingsReady || !timerReady || minutes === undefined) {
    return <Screen edges={['top']}>{null}</Screen>;
  }

  async function handleStart() {
    Keyboard.dismiss();
    const chosen = label.trim() || suggestions[0] || FALLBACK_LABEL;
    setLabel(chosen);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await timer.start(chosen, minutes ?? settings.focusMinutes);
  }

  function handleStop() {
    const isBreak = state.status !== 'idle' && state.status !== 'done' && state.phase === 'break';
    if (isBreak) {
      timer.stop();
      return;
    }
    Alert.alert('End this session?', 'Only finished sessions count toward your day.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'End session', style: 'destructive', onPress: () => timer.stop() },
    ]);
  }

  return (
    <Animated.View style={[styles.root, backgroundStyle]}>
      <Screen
        edges={inSession ? ['top', 'bottom'] : ['top']}
        backgroundColor="transparent"
        contentStyle={[styles.content, { paddingBottom: spacing.md }]}
      >
        {state.status === 'idle' ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.header}>
            <Row gap="md" justify="space-between">
              <Stack gap="sm" style={styles.shrink}>
                <Text variant="eyebrow" color="muted">
                  TODAY
                </Text>
                <Row gap="sm">
                  <GoalDots goal={settings.dailyGoal} done={todayTotals.sessions} />
                  <Text variant="caption" color="muted" numberOfLines={1} style={[styles.tabular, styles.shrink]}>
                    {todayTotals.sessions} of {settings.dailyGoal} · {formatMinutes(todayTotals.minutes)}
                  </Text>
                </Row>
              </Stack>
              <Row
                gap="xs"
                accessibilityLabel={`Streak: ${streak} ${streak === 1 ? 'day' : 'days'}`}
                style={[
                  styles.pill,
                  {
                    height: sizes.chip,
                    paddingHorizontal: spacing.ms,
                    borderRadius: radii.pill,
                    backgroundColor: streak > 0 ? colors.primarySoft : colors.surfaceStrong,
                  },
                ]}
              >
                <Icon name="flame" size={14} color={streak > 0 ? colors.primary : colors.textMuted} weight="semibold" />
                <Text variant="caption" color={streak > 0 ? 'primary' : 'muted'} numberOfLines={1} style={styles.tabular}>
                  {streak} {streak === 1 ? 'day' : 'days'}
                </Text>
              </Row>
            </Row>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.header}>
            <Stack gap="xs" align="center">
              <Text variant="eyebrow" color={state.status !== 'done' && state.phase === 'break' ? 'secondary' : 'primary'}>
                {state.status === 'done' ? 'SESSION SAVED' : state.phase === 'break' ? 'BREAK' : 'FOCUS'}
              </Text>
              <Text variant="heading" align="center" numberOfLines={1}>
                {state.label}
              </Text>
            </Stack>
          </Animated.View>
        )}

        <View style={styles.dialWrap}>
          <DialForState state={state} now={now} minutes={minutes} size={dialSize} onChange={setMinutes} />
        </View>

        <View style={[styles.bottom, { minHeight: sizes.row + sizes.chip + sizes.cta + spacing.md * 2 }]}>
          {state.status === 'idle' ? (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <Stack gap="md">
                <Row
                  gap="sm"
                  style={[
                    styles.input,
                    {
                      minHeight: sizes.row,
                      paddingHorizontal: spacing.md,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radii.pill,
                    },
                  ]}
                >
                  <Icon name="tag" size={16} color={colors.textMuted} />
                  <TextInput
                    accessibilityLabel="Session label"
                    value={label}
                    onChangeText={setLabel}
                    placeholder="What are you working on?"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="done"
                    maxLength={40}
                    maxFontSizeMultiplier={1.4}
                    style={[typography.input, styles.inputText, { color: colors.text, paddingVertical: spacing.ms }]}
                  />
                  {label ? (
                    <Pressable accessibilityRole="button" accessibilityLabel="Clear label" hitSlop={spacing.ms} onPress={() => setLabel('')}>
                      <Text variant="caption" color="muted">
                        Clear
                      </Text>
                    </Pressable>
                  ) : null}
                </Row>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  // Full-bleed strip: chips scroll to the screen edge but rest on the gutter.
                  style={{ marginHorizontal: -spacing.gutter }}
                  contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.gutter }}
                >
                  {suggestions.map((suggestion) => {
                    const active = suggestion === label;
                    return (
                      <Pressable
                        key={suggestion}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        hitSlop={{ top: spacing.xs, bottom: spacing.xs }}
                        onPress={() => {
                          void Haptics.selectionAsync();
                          setLabel(active ? '' : suggestion);
                        }}
                        style={[
                          styles.chip,
                          {
                            height: sizes.chip,
                            paddingHorizontal: spacing.ms,
                            borderRadius: radii.pill,
                            backgroundColor: active ? colors.text : colors.surface,
                            borderColor: active ? colors.text : colors.border,
                          },
                        ]}
                      >
                        <Text variant="caption" numberOfLines={1} style={{ color: active ? colors.background : colors.text }}>
                          {suggestion}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <Button title={`Start ${minutes} min`} icon="play" onPress={() => void handleStart()} />
              </Stack>
            </Animated.View>
          ) : null}

          {state.status === 'running' || state.status === 'paused' ? (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <Stack gap="md">
                <Text variant="caption" color="muted" align="center" style={styles.tabular}>
                  {state.status === 'running'
                    ? `Ends at ${formatTime(state.endsAt)} · put the phone down`
                    : `Paused · ${formatClock(state.remainingMs)} left`}
                </Text>
                <Row gap="ms">
                  {state.status === 'running' ? (
                    <Button title="Pause" icon="pause" variant="secondary" onPress={timer.pause} style={styles.grow} />
                  ) : (
                    <Button
                      title="Resume"
                      icon="play"
                      variant={state.phase === 'break' ? 'tinted' : 'primary'}
                      onPress={() => void timer.resume()}
                      style={styles.grow}
                    />
                  )}
                  <Button
                    title={state.phase === 'break' ? 'Skip break' : 'End'}
                    icon={state.phase === 'break' ? 'forward' : 'stop'}
                    variant="plain"
                    onPress={handleStop}
                    style={styles.grow}
                  />
                </Row>
              </Stack>
            </Animated.View>
          ) : null}

          {state.status === 'done' ? (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <Stack gap="md">
                <Text color="muted" align="center" numberOfLines={2}>
                  {formatMinutes(state.minutes)} of {state.label} is in your history.
                </Text>
                <Row gap="ms">
                  <Button
                    title={`Start ${state.breakMinutes} min break`}
                    icon="cup"
                    variant="tinted"
                    onPress={() => void timer.startBreak()}
                    style={styles.grow}
                  />
                  <Button title="Skip" variant="plain" onPress={timer.stop} />
                </Row>
              </Stack>
            </Animated.View>
          ) : null}
        </View>
      </Screen>
    </Animated.View>
  );
}

type DialForStateProps = {
  state: TimerState;
  now: number;
  minutes: number;
  size: number;
  onChange: (minutes: number) => void;
};

/** Picks what the dial shows for each timer state. */
function DialForState({ state, now, minutes, size, onChange }: DialForStateProps) {
  const { colors, radii, sizes } = useTheme();

  if (state.status === 'idle') {
    return (
      <Dial minutes={minutes} size={size} interactive onChange={onChange}>
        <AnimatedNumber value={minutes} format={formatCount} variant="numeralLarge" />
        <Text variant="caption" color="muted" numberOfLines={1}>
          min · turn the dial
        </Text>
      </Dial>
    );
  }

  if (state.status === 'done') {
    return (
      <Dial minutes={state.minutes} size={size} color={colors.secondary}>
        <Stack gap="sm" align="center">
          <View
            style={[
              styles.doneMark,
              { width: sizes.cta, height: sizes.cta, borderRadius: radii.pill, backgroundColor: colors.secondary },
            ]}
          >
            <Icon name="check" size={30} color={colors.onPrimary} weight="bold" />
          </View>
          <Text variant="numeralSmall" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {formatMinutes(state.minutes)}
          </Text>
        </Stack>
      </Dial>
    );
  }

  const left = remainingMs(state, now) ?? 0;
  const isBreak = state.phase === 'break';
  // Running, the clock moves under the dial at hero size; the hub keeps the session length.
  const runningSize = Math.round(size * 0.82);
  return (
    <Stack gap="lg" align="center">
      <Dial minutes={left / 60_000} size={runningSize} color={isBreak ? colors.secondary : colors.primary}>
        <Text variant="caption" color="muted" align="center" numberOfLines={2} style={styles.tabular}>
          of {state.minutes} min
        </Text>
      </Dial>
      <Text
        variant="numeral"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        style={{ opacity: state.status === 'paused' ? 0.45 : 1 }}
      >
        {formatClock(left)}
      </Text>
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { justifyContent: 'space-between' },
  header: { minHeight: 56, justifyContent: 'center' },
  shrink: { flexShrink: 1, minWidth: 0 },
  pill: { flexShrink: 0 },
  tabular: { fontVariant: ['tabular-nums'] },
  dialWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottom: { justifyContent: 'flex-end' },
  input: { borderWidth: 1.5 },
  inputText: { flex: 1, minWidth: 0 },
  chip: { justifyContent: 'center', borderWidth: 1.5 },
  grow: { flex: 1 },
  doneMark: { alignItems: 'center', justifyContent: 'center' },
});
