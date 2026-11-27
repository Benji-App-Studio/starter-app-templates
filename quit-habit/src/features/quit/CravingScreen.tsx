import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Button, ChoiceRow, Icon, Row, Screen, Section, Stack, Text } from '@/components';
import { logCraving } from '@/db/cravings';
import { useTheme } from '@/theme/theme';

import { BREATH_CYCLE_SECONDS, BreathingCircle, breathPhases } from './BreathingCircle';
import { cravingTriggers } from './habits';
import { useActiveAttempt } from './useActiveAttempt';

const CYCLES = 4;
const TOTAL_SECONDS = CYCLES * BREATH_CYCLE_SECONDS;
const MAX_CIRCLE = 300;

type Stage = 'trigger' | 'breathing' | 'done';

/** The craving button's screen: name the trigger, breathe for a minute, log that it passed. */
export function CravingScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const { attempt } = useActiveAttempt();
  const [stage, setStage] = useState<Stage>('trigger');
  const [trigger, setTrigger] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [breathedSeconds, setBreathedSeconds] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (stage !== 'breathing') {
      return;
    }
    const id = setInterval(() => {
      setElapsed((value) => {
        const next = value + 1;
        if (next >= TOTAL_SECONDS) {
          clearInterval(id);
          setBreathedSeconds((total) => total + TOTAL_SECONDS);
          setStage('done');
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [stage]);

  const inCycle = elapsed % BREATH_CYCLE_SECONDS;
  let phaseStart = 0;
  let step = breathPhases[0];
  for (const candidate of breathPhases) {
    if (inCycle < phaseStart + candidate.seconds) {
      step = candidate;
      break;
    }
    phaseStart += candidate.seconds;
  }
  const secondsLeft = step.seconds - (inCycle - phaseStart);
  const cycle = Math.min(CYCLES, Math.floor(elapsed / BREATH_CYCLE_SECONDS) + 1);

  useEffect(() => {
    if (stage === 'breathing' && inCycle === phaseStart) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [inCycle, phaseStart, stage]);

  function startBreathing() {
    setElapsed(0);
    setStage('breathing');
  }

  function stopBreathing() {
    setBreathedSeconds((total) => total + elapsed);
    setStage('done');
  }

  async function handlePassed(seconds: number) {
    if (!attempt) {
      router.back();
      return;
    }
    setSaving(true);
    await logCraving(attempt.id, trigger, seconds);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  const circleSize = Math.min(width - spacing.gutter * 2, MAX_CIRCLE);

  return (
    <Screen
      scroll
      // A page-sheet modal already starts below the status bar.
      topInset={false}
      footer={
        stage === 'trigger' ? (
          <>
            <Button title="Breathe for a minute" icon="wind" onPress={startBreathing} />
            <Button title="Just log it" variant="ghost" onPress={() => handlePassed(0)} loading={saving} />
          </>
        ) : stage === 'breathing' ? (
          <Button title="Stop" variant="ghost" onPress={stopBreathing} />
        ) : (
          <>
            <Button title="It passed" icon="checkCircle" onPress={() => handlePassed(breathedSeconds)} loading={saving} />
            <Button title="Breathe again" variant="secondary" onPress={startBreathing} />
          </>
        )
      }
    >
      <Stack gap="lg" grow>
        <Row justify="flex-end">
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={styles.close}>
            <Icon name="close" size={20} color={colors.textMuted} />
          </Pressable>
        </Row>

        {stage === 'trigger' ? (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <Stack gap="xl">
              <Stack gap="sm">
                <Text variant="title" numberOfLines={3}>
                  A craving. Let it pass.
                </Text>
                <Text color="muted">
                  Cravings rise and fall like a wave. Give this one a minute of slow breathing, then see where it is.
                </Text>
              </Stack>
              <Section title="What set it off?" variant="group">
                <Stack gap="item">
                  {cravingTriggers.map((candidate) => (
                    <ChoiceRow
                      key={candidate.id}
                      label={candidate.label}
                      icon={candidate.icon}
                      selected={candidate.id === trigger}
                      onPress={() => setTrigger(candidate.id === trigger ? null : candidate.id)}
                    />
                  ))}
                </Stack>
              </Section>
            </Stack>
          </Animated.View>
        ) : null}

        {stage === 'breathing' ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.center}>
            <Stack align="center" gap="lg">
              <BreathingCircle size={circleSize} phase={step.phase} secondsLeft={secondsLeft} />
              <Text variant="caption" color="muted" tabular>
                Round {cycle} of {CYCLES}
              </Text>
            </Stack>
          </Animated.View>
        ) : null}

        {stage === 'done' ? (
          <Animated.View entering={FadeIn} style={styles.center}>
            <Stack align="center" gap="md">
              <View style={[styles.doneIcon, { backgroundColor: colors.primarySoft }]}>
                <Icon name="heart" size={40} color={colors.primary} />
              </View>
              <Stack align="center" gap="sm">
                <Text variant="title" align="center">
                  Still here. Still free.
                </Text>
                <Text color="muted" align="center" style={styles.doneBody}>
                  If it is still hanging around, a glass of water, a short walk or a message to someone can carry you the rest of the way.
                </Text>
              </Stack>
            </Stack>
          </Animated.View>
        ) : null}
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  center: { flexGrow: 1, justifyContent: 'center' },
  doneIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  doneBody: { maxWidth: 320 },
});
