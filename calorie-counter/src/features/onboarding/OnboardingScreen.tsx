import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedNumber, Button, Icon, Row, Screen, Stack, Text } from '@/components';
import { onboardingSteps, type OnboardingOption } from '@/config/onboarding';
import { CalorieRing, ringNumeralStyle } from '@/features/diary/CalorieRing';
import { macroTargets, suggestedTarget, targetParts } from '@/features/diary/target';
import { appState, useAppState } from '@/state/appState';
import { spacing as grid, useTheme } from '@/theme/theme';

const RING_SIZE = 200;
const PLAN_RING_SIZE = 220;
const WELCOME_RING_MAX = 300;
const BUILD_MS = 1300;
/** A believable part-way day for the ring on the first screen. */
const PREVIEW_EATEN_RATIO = 0.58;

type OnboardingScreenProps = {
  /** Zero-based index into `onboardingSteps`. */
  step: number;
};

function ProgressBar({ step }: { step: number }) {
  const { colors, radii } = useTheme();
  const reduceMotion = useReducedMotion();
  const width = useSharedValue(0);
  const fraction = (step + 1) / onboardingSteps.length;

  useEffect(() => {
    width.value = reduceMotion ? withTiming(fraction, { duration: 150 }) : withSpring(fraction, { damping: 20, stiffness: 120 });
  }, [fraction, reduceMotion, width]);

  const fill = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: onboardingSteps.length, now: step + 1 }}
      style={[styles.track, { backgroundColor: colors.border, borderRadius: radii.pill }]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: colors.text, borderRadius: radii.pill }, fill]} />
    </View>
  );
}

function OptionRow({ option, selected, onPress }: { option: OnboardingOption; selected: boolean; onPress: () => void }) {
  const { colors, radii, spacing } = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: colors.surface,
          borderColor: selected ? colors.text : colors.border,
          borderRadius: radii.lg,
          padding: spacing.md,
          gap: spacing.md,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
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
          styles.radio,
          {
            borderColor: selected ? colors.text : colors.border,
            backgroundColor: selected ? colors.text : 'transparent',
            borderRadius: radii.pill,
          },
        ]}
      >
        {selected ? <Icon name="check" size={13} color={colors.background} weight="bold" /> : null}
      </View>
    </Pressable>
  );
}

/** The ring previewing the plan: the target number in the middle, a part-way day around it. */
function PlanPreview({
  target,
  caption,
  size = RING_SIZE,
  full = false,
}: {
  target: number;
  caption: string;
  size?: number;
  full?: boolean;
}) {
  const macros = macroTargets(target);
  const ratio = full ? 1 : PREVIEW_EATEN_RATIO;
  const eaten = {
    calories: target * ratio,
    protein: macros.protein * (full ? 1 : 0.7),
    carbs: macros.carbs * (full ? 1 : 0.5),
    fat: macros.fat * (full ? 1 : 0.62),
  };

  return (
    <CalorieRing size={size} target={target} eaten={eaten} macroTargets={macros}>
      <AnimatedNumber value={target} style={ringNumeralStyle(size)} />
      <Text variant="caption" color="muted">
        {caption}
      </Text>
    </CalorieRing>
  );
}

const GOAL_LINE: Record<string, string> = {
  lose: 'To lose steadily',
  maintain: 'To stay where you are',
  gain: 'To gain steadily',
};

function signed(value: number): string {
  if (value === 0) {
    return '0';
  }
  return `${value > 0 ? '+' : '\u2212'}${Math.abs(value).toLocaleString()}`;
}

/** The last step: a short build moment, then the target with the sum it came from. */
function PlanStep({ answers, onReady }: { answers: Record<string, string>; onReady: () => void }) {
  const { colors, radii, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const target = suggestedTarget(answers);
  const { maintenance, adjustment } = targetParts(answers);
  const macros = macroTargets(target);
  const config = onboardingSteps[onboardingSteps.length - 1];

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onReady();
    }, BUILD_MS);
    return () => clearTimeout(timer);
  }, [onReady]);

  const sum = [
    { label: 'Burned on a day like yours', value: maintenance.toLocaleString() },
    { label: GOAL_LINE[answers.goal] ?? 'Goal adjustment', value: signed(adjustment) },
  ];
  const split = [
    { label: 'Protein', grams: macros.protein, color: colors.protein },
    { label: 'Carbs', grams: macros.carbs, color: colors.carbs },
    { label: 'Fat', grams: macros.fat, color: colors.fat },
  ];

  return (
    <View style={[styles.centered, { gap: spacing.xl }]}>
      <View style={styles.illustration}>
        <PlanPreview target={target} caption="kcal a day" size={PLAN_RING_SIZE} full={ready} />
      </View>
      {ready ? (
        <Animated.View entering={reduceMotion ? FadeIn : FadeInUp.springify().damping(18)} style={{ gap: spacing.lg }}>
          <View style={{ gap: spacing.sm }}>
            <Text variant="title" align="center">
              {config.title}
            </Text>
            <Text color="muted" align="center">
              {config.body}
            </Text>
          </View>
          <View
            style={[
              styles.planCard,
              { borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.ms },
            ]}
          >
            {sum.map((row) => (
              <Row key={row.label} gap="md">
                <Text color="muted" style={styles.optionBody}>
                  {row.label}
                </Text>
                <Text variant="label" style={styles.tabular}>
                  {row.value}
                </Text>
              </Row>
            ))}
            <Row gap="md" style={[styles.divided, { paddingTop: spacing.ms, borderTopColor: colors.border }]}>
              <Text variant="label" style={styles.optionBody}>
                Your daily target
              </Text>
              <Text variant="label" color="primary" style={styles.tabular}>
                {target.toLocaleString()} kcal
              </Text>
            </Row>
            <Row gap="sm" align="flex-start" style={[styles.divided, { paddingTop: spacing.ms, borderTopColor: colors.border }]}>
              {split.map((row) => (
                <Stack key={row.label} gap="xs" style={styles.optionBody}>
                  <Row gap="sm">
                    <View style={[styles.dot, { backgroundColor: row.color }]} />
                    <Text variant="caption" color="muted">
                      {row.label}
                    </Text>
                  </Row>
                  <Text variant="label" style={styles.tabular}>
                    {row.grams} g
                  </Text>
                </Stack>
              ))}
            </Row>
          </View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn} style={{ gap: spacing.sm }}>
          <Text variant="heading" align="center">
            Building your plan
          </Text>
          <Text color="muted" align="center">
            {`${maintenance.toLocaleString()} burned on a day like yours, ${signed(adjustment)} for your goal.`}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

export function OnboardingScreen({ step }: OnboardingScreenProps) {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const { onboardingAnswers } = useAppState();
  const config = onboardingSteps[step];
  const isWelcome = step === 0;
  const welcomeRingSize = Math.min(width - spacing.gutter * 2 - spacing.xl * 2, WELCOME_RING_MAX);
  const [answer, setAnswer] = useState<string | undefined>(
    config.question ? onboardingAnswers[config.question.id] : undefined,
  );
  const [planReady, setPlanReady] = useState(false);
  const onPlanReady = useCallback(() => setPlanReady(true), []);
  const isLast = step === onboardingSteps.length - 1;
  const canContinue = isLast ? planReady : !config.question || answer !== undefined;
  const previewAnswers = config.question && answer ? { ...onboardingAnswers, [config.question.id]: answer } : onboardingAnswers;
  const previewTarget = suggestedTarget(previewAnswers);

  function choose(optionId: string) {
    void Haptics.selectionAsync();
    setAnswer(optionId);
  }

  function handleContinue() {
    if (config.question && answer) {
      appState.set({ onboardingAnswers: { ...onboardingAnswers, [config.question.id]: answer } });
    }
    if (isLast) {
      appState.set({ onboardingDone: true });
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
          disabled={!canContinue}
        />
      }
    >
      <Stack gap="lg" style={styles.stepBody}>
        <View style={[styles.top, { gap: spacing.md }]}>
          <View style={styles.backSlot}>
            {step > 0 ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={() => router.back()}>
                <Icon name="back" size={20} color={colors.text} weight="semibold" />
              </Pressable>
            ) : null}
          </View>
          <ProgressBar step={step} />
          <View style={styles.backSlot} />
        </View>

        {isLast ? (
          <PlanStep answers={previewAnswers} onReady={onPlanReady} />
        ) : (
          <Stack gap={isWelcome ? 'xl' : 'lg'} style={styles.centered}>
            <View style={styles.illustration}>
              <PlanPreview target={previewTarget} caption="kcal a day" size={isWelcome ? welcomeRingSize : RING_SIZE} />
            </View>

            <Stack gap="sm">
              <Text variant={isWelcome ? 'display' : 'title'} align={isWelcome ? 'center' : 'left'} numberOfLines={3}>
                {config.title}
              </Text>
              <Text color="muted" align={isWelcome ? 'center' : 'left'}>
                {config.body}
              </Text>
            </Stack>

            {config.question ? (
              <Stack gap="ms">
                {config.question.options.map((option) => (
                  <OptionRow
                    key={option.id}
                    option={option}
                    selected={option.id === answer}
                    onPress={() => choose(option.id)}
                  />
                ))}
              </Stack>
            ) : null}
          </Stack>
        )}
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  stepBody: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center' },
  backSlot: { width: 28, height: 28, justifyContent: 'center' },
  track: { flex: 1, height: 4, overflow: 'hidden' },
  fill: { height: '100%' },
  centered: { flex: 1, justifyContent: 'center' },
  illustration: { alignItems: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, minHeight: 64 },
  optionBody: { flex: 1, minWidth: 0, gap: grid.xs },
  radio: { width: 24, height: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  planCard: { borderWidth: 1 },
  divided: { borderTopWidth: StyleSheet.hairlineWidth },
  dot: { width: 10, height: 10, borderRadius: 5 },
  tabular: { fontVariant: ['tabular-nums'] },
});
