import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { GestureDetector, useLongPressGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button, Card, Icon, Row, Screen, Section, Stack, Text } from '@/components';
import { endAttempt, startAttempt } from '@/db/attempts';
import { useTheme } from '@/theme/theme';

import { formatUnits, habits } from './habits';
import { formatMoney, useProfile } from './profile';
import { attemptSavings } from './savings';
import { formatDuration } from './time';
import { useActiveAttempt } from './useActiveAttempt';

const HOLD_MS = 1200;

/** Logging a slip: keeps the attempt in history and starts a fresh counter after a deliberate hold. */
export function SlipScreen() {
  const router = useRouter();
  const { colors, radii, spacing, typography } = useTheme();
  const profile = useProfile();
  const { attempt } = useActiveAttempt();
  const [note, setNote] = useState('');
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    if (!attempt || !profile || resetting) {
      return;
    }
    setResetting(true);
    const now = Date.now();
    await endAttempt(attempt.id, now, note.trim() || null);
    await startAttempt(now, profile.unitsPerDay, profile.costPerDay);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    router.back();
  }

  const savings = attempt ? attemptSavings(attempt, Date.now()) : undefined;
  const habit = profile ? habits[profile.habit] : undefined;

  return (
    <Screen
      scroll
      // A page-sheet modal already starts below the status bar.
      topInset={false}
      footer={
        <>
          <HoldToConfirm label="Hold to reset the counter" onConfirm={handleReset} busy={resetting} />
          <Button title="Keep counting" variant="ghost" onPress={() => router.back()} />
        </>
      }
    >
      <Stack gap="lg">
        <Row justify="flex-end">
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={styles.close}>
            <Icon name="close" size={20} color={colors.textMuted} />
          </Pressable>
        </Row>

        <Stack gap="sm">
          <Text variant="title" numberOfLines={3}>
            A slip, not the end.
          </Text>
          <Text color="muted">
            Slips happen on the way for a lot of people. Resetting starts a new counter now; the run you just had stays in your history.
          </Text>
        </Stack>

        {savings && habit && profile ? (
          <Card>
            <Stack gap="xs">
              <Text variant="overline" color="muted">
                THIS RUN
              </Text>
              <Text variant="heading" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {formatDuration(savings.elapsedMs)}
              </Text>
              <Text color="muted">
                {formatMoney(savings.money, profile.currency)} kept and {formatUnits(savings.units, habit)} {habit.avoidedLabel}. None of that is undone.
              </Text>
            </Stack>
          </Card>
        ) : null}

        <Section title="What happened? (optional)" variant="group">
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="A rough day at work, a drink with friends…"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={200}
            style={[
              typography.body,
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radii.md,
                padding: spacing.md,
              },
            ]}
          />
        </Section>
      </Stack>
    </Screen>
  );
}

/** A button you hold for ~1 s: the fill tracks the hold and commits with a haptic. */
function HoldToConfirm({ label, onConfirm, busy }: { label: string; onConfirm: () => void; busy: boolean }) {
  const { colors, radii, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const fill = useSharedValue(0);
  const committed = useRef(false);

  const gesture = useLongPressGesture({
    minDuration: HOLD_MS,
    maxDistance: 24,
    runOnJS: true,
    onBegin: () => {
      committed.current = false;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      fill.value = reducedMotion ? 1 : withTiming(1, { duration: HOLD_MS });
    },
    onActivate: () => {
      committed.current = true;
      onConfirm();
    },
    onFinalize: () => {
      // Let go early: the fill springs back and nothing happens.
      if (!committed.current) {
        fill.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    },
  });

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Press and hold"
        style={[
          styles.hold,
          { backgroundColor: colors.dangerSoft, borderRadius: radii.md, opacity: busy ? 0.5 : 1 },
        ]}
      >
        <Animated.View style={[styles.holdFill, fillStyle, { backgroundColor: colors.danger }]} />
        <Row gap="sm" justify="center" style={{ paddingHorizontal: spacing.md }}>
          <Icon name="slip" size={18} color={colors.danger} />
          <Text variant="label" color="danger" numberOfLines={1}>
            {label}
          </Text>
        </Row>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  input: { minHeight: 96, borderWidth: 1, textAlignVertical: 'top' },
  hold: { minHeight: 56, overflow: 'hidden', justifyContent: 'center' },
  holdFill: { position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.25 },
});
