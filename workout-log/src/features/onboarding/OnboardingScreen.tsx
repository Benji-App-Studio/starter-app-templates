import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { Button, Fill, Group, Icon, ProgressBar, Row, Screen, Stack, Text } from '@/components';
import { DAYS_QUESTION_ID, EXPERIENCE_QUESTION_ID, onboardingSteps, type OnboardingOption, type OnboardingPreview } from '@/config/onboarding';
import { WeekRing } from '@/features/home/WeekRing';
import { goalFromAnswer } from '@/features/home/weeklyGoal';
import { seedStarterRoutines, starterPlanFor } from '@/features/routines/starterRoutines';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { SetTablePreview } from './SetTablePreview';

/** The plan step shows its rows after this, even when seeding is faster. */
const BUILD_MS = 1200;

type OnboardingScreenProps = {
  /** Zero-based index into `onboardingSteps`. */
  step: number;
};

/**
 * One layout for every step: progress on top, the hero centred in the free space, the copy and
 * choices under it, the button pinned above the home indicator. The hero area flexes, so a short
 * step never leaves an empty lower half and a long one scrolls.
 */
export function OnboardingScreen({ step }: OnboardingScreenProps) {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { onboardingAnswers } = useAppState();
  const config = onboardingSteps[step];
  const [answer, setAnswer] = useState<string | undefined>(
    config.question ? onboardingAnswers[config.question.id] : undefined,
  );
  const [built, setBuilt] = useState(config.preview !== 'plan');
  const isLast = step === onboardingSteps.length - 1;
  const canContinue = built && (!config.question || answer !== undefined);
  const answers = config.question && answer ? { ...onboardingAnswers, [config.question.id]: answer } : onboardingAnswers;

  useEffect(() => {
    if (config.preview !== 'plan') {
      return;
    }
    let cancelled = false;
    const started = Date.now();
    seedStarterRoutines().finally(() => {
      const wait = Math.max(0, BUILD_MS - (Date.now() - started));
      setTimeout(() => {
        if (!cancelled) {
          setBuilt(true);
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, wait);
    });
    return () => {
      cancelled = true;
    };
  }, [config.preview]);

  function choose(id: string) {
    void Haptics.selectionAsync();
    setAnswer(id);
  }

  function handleContinue() {
    if (config.question && answer) {
      appState.set({ onboardingAnswers: answers });
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
          loading={!built}
        />
      }
    >
      <Stack gap="lg" style={styles.content}>
        <Row gap="md">
          <View style={styles.progress}>
            <ProgressBar value={(step + 1) / onboardingSteps.length} accessibilityLabel="Onboarding progress" />
          </View>
          <Text variant="caption" color="muted">
            {step + 1} of {onboardingSteps.length}
          </Text>
        </Row>

        {/* Question steps keep the hero short so all four options fit above the button. */}
        <View style={[styles.hero, { minHeight: config.question ? Math.min(200, height * 0.2) : Math.min(280, height * 0.3) }]}>
          <Hero preview={config.preview} answers={answers} built={built} />
        </View>

        <Stack gap="lg">
          <Stack gap="sm">
            <Text variant="title" accessibilityRole="header" numberOfLines={3}>
              {config.title}
            </Text>
            <Text color="muted">{config.body}</Text>
          </Stack>

          {config.question ? (
            <Stack gap="smd">
              {config.question.options.map((option) => (
                <OptionRow key={option.id} option={option} selected={option.id === answer} onPress={() => choose(option.id)} />
              ))}
            </Stack>
          ) : null}

          {config.preview === 'plan' ? <PlanRows answers={answers} built={built} /> : null}
        </Stack>
      </Stack>
    </Screen>
  );
}

type OptionRowProps = { option: OnboardingOption; selected: boolean; onPress: () => void };

function OptionRow({ option, selected, onPress }: OptionRowProps) {
  const { colors, radii, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          gap: spacing.smd,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.smd,
          borderRadius: radii.lg,
          backgroundColor: selected ? colors.primarySoft : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Fill>
        <Text variant="heading" numberOfLines={1}>
          {option.label}
        </Text>
        {option.detail ? (
          <Text variant="caption" color="muted" numberOfLines={1}>
            {option.detail}
          </Text>
        ) : null}
      </Fill>
      <View
        style={[
          styles.radio,
          {
            borderRadius: radii.pill,
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : 'transparent',
          },
        ]}
      >
        {selected ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}
      </View>
    </Pressable>
  );
}

type HeroProps = { preview: OnboardingPreview; answers: Record<string, string>; built: boolean };

/** The visual slot: the set table on the welcome step, live previews of the split and week ring after. */
function Hero({ preview, answers, built }: HeroProps) {
  const { colors, radii, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const goal = goalFromAnswer(answers[DAYS_QUESTION_ID]);
  const plan = starterPlanFor(answers[EXPERIENCE_QUESTION_ID]);

  switch (preview) {
    case 'table':
      return <SetTablePreview />;
    case 'ring': {
      const chosen = answers[DAYS_QUESTION_ID];
      const days = Array.from({ length: 7 }, (_, index) => chosen !== undefined && index < goal);
      return <WeekRing days={days} goal={goal} size={210} caption={chosen ? 'a week' : 'pick below'} />;
    }
    case 'plan': {
      const days = Array.from({ length: 7 }, (_, index) => built && index < goal);
      return <WeekRing days={days} goal={goal} size={210} caption={built ? 'a week' : 'building'} stagger />;
    }
    case 'split':
      return (
        <Stack gap="sm" style={styles.split}>
          {plan.routines.map((routine, index) => (
            <Animated.View
              key={`${plan.splitName}-${routine.name}`}
              entering={reducedMotion ? undefined : FadeInDown.delay(index * 60).springify().damping(16)}
              layout={reducedMotion ? undefined : LinearTransition}
              style={[
                styles.chip,
                {
                  gap: spacing.smd,
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radii.md,
                },
              ]}
            >
              <View style={[styles.chipIndex, { backgroundColor: colors.primary, borderRadius: radii.pill }]}>
                <Text variant="badge" color="onPrimary">
                  {index + 1}
                </Text>
              </View>
              <Fill>
                <Text variant="heading" numberOfLines={1}>
                  {routine.name}
                </Text>
              </Fill>
              <Text variant="caption" color="muted">
                {routine.exercises.length} exercises
              </Text>
            </Animated.View>
          ))}
        </Stack>
      );
  }
}

type PlanRowsProps = { answers: Record<string, string>; built: boolean };

/** The "Your plan" table: every value is computed from the two answers and the settings defaults. */
function PlanRows({ answers, built }: PlanRowsProps) {
  const { colors, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const { restSeconds, units } = useAppState();
  const plan = starterPlanFor(answers[EXPERIENCE_QUESTION_ID]);
  const goal = goalFromAnswer(answers[DAYS_QUESTION_ID]);
  const exerciseCount = plan.routines.reduce((sum, routine) => sum + routine.exercises.length, 0);
  const setCount = plan.routines.reduce(
    (sum, routine) => sum + routine.exercises.reduce((total, exercise) => total + exercise.targetSets, 0),
    0,
  );
  const rows: { label: string; value: string }[] = [
    { label: 'Split', value: plan.splitName },
    { label: 'Routines', value: plan.routines.map((routine) => routine.name).join(', ') },
    { label: 'Exercises', value: `${exerciseCount} exercises, ${setCount} sets` },
    { label: 'Weekly goal', value: `${goal} sessions, Monday to Sunday` },
    { label: 'Rest timer', value: `${restSeconds} s after each set, weights in ${units}` },
  ];

  if (!built) {
    return (
      <Text color="muted">
        Writing {plan.routines.length} routines for {plan.splitName}…
      </Text>
    );
  }

  return (
    <Group>
      {rows.map((row, index) => (
        <Animated.View
          key={row.label}
          entering={reducedMotion ? FadeIn : FadeInDown.delay(index * 90).springify().damping(16)}
          style={[
            styles.planRow,
            {
              gap: spacing.md,
              paddingVertical: spacing.smd,
              borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
              borderTopColor: colors.border,
            },
          ]}
        >
          <Text variant="caption" color="muted" style={styles.planLabel} numberOfLines={1}>
            {row.label}
          </Text>
          <Text variant="label" style={styles.planValue}>
            {row.value}
          </Text>
        </Animated.View>
      ))}
    </Group>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  progress: { flex: 1 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 64, borderWidth: 1 },
  radio: { width: 26, height: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  split: { width: '100%', maxWidth: 360 },
  chip: { flexDirection: 'row', alignItems: 'center', height: 52, borderWidth: 1 },
  chipIndex: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  planRow: { flexDirection: 'row', alignItems: 'baseline', minHeight: 48 },
  planLabel: { width: 96 },
  planValue: { flex: 1, minWidth: 0 },
});
