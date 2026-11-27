import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { Button, Card, Icon, ProgressBar, Screen, Text } from '@/components';
import { onboardingSteps } from '@/config/onboarding';
import { Blob } from '@/features/mixer/Blob';
import { formatTimer } from '@/features/mixer/format';
import { HeroCaption } from '@/features/mixer/HeroCaption';
import { buildNightPlan } from '@/features/mixer/plan';
import { soundById } from '@/features/mixer/sounds';
import { appState, useAppState } from '@/state/appState';
import { spacing, useTheme } from '@/theme/theme';

const BLOB_SIZE = 250;
/** How long the closing step shows the mix being shaped before the plan appears. */
const BUILD_MS = 1200;

const welcomePoints = [
  { icon: 'slider', title: 'Mix your own sound', body: 'Rain, noise, waves and low tones, each at its own level.' },
  { icon: 'timer', title: 'Fade to silence', body: 'A sleep timer that lowers the mix slowly, then stops.' },
  { icon: 'chart', title: 'See your nights', body: 'How long you listened and how you slept.' },
] as const;

type OnboardingScreenProps = {
  /** Zero-based index into `onboardingSteps`. */
  step: number;
};

export function OnboardingScreen({ step }: OnboardingScreenProps) {
  const router = useRouter();
  const { colors, radii, scheme, spacing } = useTheme();
  const { onboardingAnswers } = useAppState();
  const config = onboardingSteps[step];
  const [answer, setAnswer] = useState<string | undefined>(
    config.question ? onboardingAnswers[config.question.id] : undefined,
  );
  const isLast = step === onboardingSteps.length - 1;
  const canContinue = !config.question || answer !== undefined;
  const [building, setBuilding] = useState(isLast);

  useEffect(() => {
    if (!isLast) {
      return;
    }
    const handle = setTimeout(() => setBuilding(false), BUILD_MS);
    return () => clearTimeout(handle);
  }, [isLast]);

  // The hero reacts to the answer being considered, so each choice is heard before it is made.
  const previewAnswers = config.question && answer ? { ...onboardingAnswers, [config.question.id]: answer } : onboardingAnswers;
  const plan = buildNightPlan(previewAnswers);
  const previewTints = step === 0 ? [] : plan.sounds.map((entry) => soundById[entry.id].tint);
  const energy = step === 0 ? 0.45 : isLast ? (building ? 0.9 : 0.7) : answer ? 0.65 : 0.3;

  function handleSelect(optionId: string) {
    void Haptics.selectionAsync();
    setAnswer(optionId);
  }

  function handleContinue() {
    if (config.question && answer) {
      appState.set({ onboardingAnswers: { ...onboardingAnswers, [config.question.id]: answer } });
    }
    if (isLast) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      appState.set({ timerMinutes: plan.timerMinutes, onboardingDone: true });
      return;
    }
    router.push(`/${step + 1}`);
  }

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      footer={
        <Button
          title={isLast ? 'Get started' : 'Continue'}
          onPress={handleContinue}
          disabled={!canContinue || building}
        />
      }
    >
      <ProgressBar
        progress={(step + 1) / onboardingSteps.length}
        accessibilityLabel={`Step ${step + 1} of ${onboardingSteps.length}`}
      />

      <View style={[styles.illustration, { marginVertical: spacing.lg }]}>
        {config.image ? (
          <Image source={config.image} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={{ width: BLOB_SIZE, height: BLOB_SIZE }}>
            <Blob tints={previewTints} energy={energy} size={BLOB_SIZE} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, styles.center]}>
              {step === 0 ? (
                <Icon
                  name={config.icon}
                  size={44}
                  // The welcome blob is the saturated accent, so the glyph is white on it in light mode.
                  color={scheme === 'dark' ? colors.text : colors.onPrimary}
                  weight="light"
                />
              ) : isLast && building ? (
                <Animated.View key="building" exiting={FadeOut} style={styles.center}>
                  <Text variant="label" color="muted">
                    Shaping your mix
                  </Text>
                </Animated.View>
              ) : (
                <Animated.View key={plan.title + plan.timerMinutes} entering={FadeIn} style={styles.center}>
                  <Text variant="numeral" tabular>
                    {plan.timerMinutes === null ? '∞' : plan.timerMinutes}
                  </Text>
                  <HeroCaption>{plan.timerMinutes === null ? 'plays all night' : 'minutes, then silence'}</HeroCaption>
                </Animated.View>
              )}
            </View>
          </View>
        )}
      </View>

      <Text variant="title">{config.title}</Text>
      <Text color="muted" style={{ marginTop: spacing.sm }}>
        {config.body}
      </Text>

      {step === 0 ? (
        <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
          {welcomePoints.map((point, index) => (
            <Animated.View
              key={point.title}
              entering={FadeInDown.delay(150 + index * 120).springify().damping(18)}
              style={[styles.point, { gap: spacing.md }]}
            >
              <View
                style={[
                  styles.pointIcon,
                  { backgroundColor: colors.primarySoft, borderRadius: radii.md, borderCurve: 'continuous' },
                ]}
              >
                <Icon name={point.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.optionBody}>
                <Text variant="label">{point.title}</Text>
                <Text variant="caption" color="muted">
                  {point.body}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      ) : null}

      {config.question ? (
        <View style={{ gap: spacing.item, marginTop: spacing.lg }}>
          {config.question.options.map((option) => {
            const selected = option.id === answer;
            return (
              <Card key={option.id} selected={selected} onPress={() => handleSelect(option.id)}>
                <View style={[styles.option, { gap: spacing.md }]}>
                  <View style={styles.optionBody}>
                    <Text variant="label">{option.label}</Text>
                    {option.detail ? (
                      <Text variant="caption" color="muted">
                        {option.detail}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.check,
                      {
                        borderRadius: radii.pill,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {selected ? <Icon name="check" size={13} color={colors.onPrimary} weight="bold" /> : null}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      ) : null}

      {isLast ? (
        <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
          {plan.reasons.map((reason, index) => (
            <Animated.View
              key={reason}
              entering={FadeInDown.delay((index * BUILD_MS) / (plan.reasons.length + 1)).springify().damping(18)}
              style={[styles.point, { gap: spacing.sm }]}
            >
              <Icon name="check" size={13} color={colors.primary} weight="bold" />
              <Text variant="caption" color="muted" style={styles.optionBody}>
                {reason}
              </Text>
            </Animated.View>
          ))}
        </View>
      ) : null}

      {isLast && !building ? (
        <Animated.View entering={FadeInDown.springify().damping(18)} style={{ marginTop: spacing.lg }}>
          <Card>
            <Text variant="caption" color="muted">
              YOUR FIRST MIX
            </Text>
            <Text variant="heading" style={{ marginTop: spacing.sm }}>
              {plan.title}
            </Text>
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              {plan.sounds.map((entry) => (
                <View key={entry.id} style={[styles.planRow, { gap: spacing.sm }]}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: radii.pill,
                      backgroundColor: soundById[entry.id].tint,
                    }}
                  />
                  <Text style={styles.planName}>{soundById[entry.id].name}</Text>
                  <Text variant="caption" color="muted" tabular>
                    {Math.round(entry.volume * 100)}%
                  </Text>
                </View>
              ))}
              <View style={[styles.planRow, { gap: spacing.sm }]}>
                <Icon name="timer" size={14} color={colors.textMuted} />
                <Text style={styles.planName}>Sleep timer</Text>
                <Text variant="caption" color="muted">
                  {formatTimer(plan.timerMinutes)}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  illustration: { alignItems: 'center' },
  image: { width: 220, height: 220 },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center' },
  optionBody: { flex: 1, gap: spacing.sm },
  check: { width: 24, height: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  point: { flexDirection: 'row', alignItems: 'center' },
  pointIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  planName: { flex: 1 },
});
