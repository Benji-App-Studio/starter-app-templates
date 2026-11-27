import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Button, Card, Icon, ProgressBar, Row, Screen, Stack, Text } from '@/components';
import { onboardingSteps, type OnboardingOption } from '@/config/onboarding';
import { Dial, dialHubRadius } from '@/features/focus/Dial';
import { defaultsFromAnswers } from '@/features/focus/focusSettings';
import { GoalDots } from '@/features/focus/GoalDots';
import { suggestedLabels } from '@/features/focus/labels';
import { formatMinutes } from '@/features/focus/stats';
import { appState, useAppState } from '@/state/appState';
import { typography, useTheme } from '@/theme/theme';

const PLAN_BUILD_MS = 1300;
const PREVIEW_MAX = 236;

type OnboardingScreenProps = {
  /** Zero-based index into `onboardingSteps`. */
  step: number;
};

export function OnboardingScreen({ step }: OnboardingScreenProps) {
  const router = useRouter();
  const { colors, radii, spacing } = useTheme();
  const { height, width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const { onboardingAnswers } = useAppState();
  const config = onboardingSteps[step];
  // Question steps keep the dial small so all four options fit above the button; the welcome
  // step has only copy under it, so the dial gets the room.
  const previewSize = Math.round(
    config.question
      ? Math.min(PREVIEW_MAX, height * 0.2)
      : config.kind === 'plan'
        ? Math.min(PREVIEW_MAX, height * 0.27)
        : Math.min(width - spacing.gutter * 2, height * 0.36),
  );
  const [answer, setAnswer] = useState<string | undefined>(
    config.question ? onboardingAnswers[config.question.id] : undefined,
  );
  const isLast = step === onboardingSteps.length - 1;
  const isPlan = config.kind === 'plan';
  const [building, setBuilding] = useState(isPlan);

  useEffect(() => {
    if (!isPlan) {
      return;
    }
    const id = setTimeout(() => setBuilding(false), PLAN_BUILD_MS);
    return () => clearTimeout(id);
  }, [isPlan]);

  const draft = config.question && answer ? { ...onboardingAnswers, [config.question.id]: answer } : onboardingAnswers;
  const plan = defaultsFromAnswers(draft);
  const labels = suggestedLabels(draft.purpose, []);
  const canContinue = (!config.question || answer !== undefined) && !building;

  function choose(option: OnboardingOption) {
    void Haptics.selectionAsync();
    setAnswer(option.id);
  }

  function handleContinue() {
    if (config.question && answer) {
      appState.set({ onboardingAnswers: { ...onboardingAnswers, [config.question.id]: answer } });
    }
    if (isLast) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      <ProgressBar
        progress={(step + 1) / onboardingSteps.length}
        accessibilityLabel={`Step ${step + 1} of ${onboardingSteps.length}`}
      />

      {/* The hero takes the free space and centres in it, so short steps never leave an empty lower half. */}
      <View style={[styles.hero, { minHeight: previewSize + spacing.lg * 2, paddingVertical: spacing.lg }]}>
        {config.image ? (
          <Image source={config.image} style={{ width: previewSize, height: previewSize }} resizeMode="contain" />
        ) : (
          <Preview
            stepId={config.id}
            size={previewSize}
            minutes={plan.focusMinutes}
            goal={plan.dailyGoal}
            label={labels[0]}
            building={building}
          />
        )}
      </View>

      <Stack gap="lg">
        {isPlan ? (
          building ? (
            <Stack gap="sm">
              <Text variant="title" numberOfLines={2}>
                Setting your dial
              </Text>
              <Text color="muted" numberOfLines={2}>
                {plan.focusMinutes} minutes on, {plan.breakMinutes} off, {plan.dailyGoal} times a day.
              </Text>
            </Stack>
          ) : (
            <Animated.View entering={reducedMotion ? FadeIn : FadeInDown.springify().damping(18)}>
              <Stack gap="md">
                <Text variant="title" numberOfLines={2}>
                  {config.title}
                </Text>
                <Card>
                  <Stack gap="md">
                    <PlanLine icon="timer" text={`${plan.focusMinutes}-minute sessions, ${plan.breakMinutes}-minute breaks`} />
                    <PlanLine
                      icon="target"
                      text={`${plan.dailyGoal} sessions a day, about ${formatMinutes(plan.focusMinutes * plan.dailyGoal)} of focus`}
                    />
                    <PlanLine icon="tag" text={`Starting labels: ${labels.slice(0, 3).join(', ')}`} />
                  </Stack>
                </Card>
                <Text variant="caption" color="muted">
                  Change any of this later in Settings.
                </Text>
              </Stack>
            </Animated.View>
          )
        ) : (
          <Animated.View key={config.id} entering={FadeIn}>
            <Stack gap="sm">
              <Text variant="title" numberOfLines={3}>
                {config.title}
              </Text>
              <Text color="muted">{config.body}</Text>
            </Stack>
          </Animated.View>
        )}

        {config.question ? (
          <Stack gap="ms">
            {config.question.options.map((option) => {
              const selected = option.id === answer;
              return (
                <Card key={option.id} selected={selected} onPress={() => choose(option)}>
                  <Row gap="md">
                    {option.icon ? (
                      <Icon name={option.icon} size={22} color={selected ? colors.primary : colors.textMuted} />
                    ) : null}
                    <Stack gap="xs" style={styles.optionBody}>
                      <Text variant="label" numberOfLines={1}>
                        {option.label}
                      </Text>
                      {option.detail ? (
                        <Text variant="caption" color="muted" numberOfLines={2}>
                          {option.detail}
                        </Text>
                      ) : null}
                    </Stack>
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
                      {selected ? <Icon name="check" size={12} color={colors.onPrimary} weight="bold" /> : null}
                    </View>
                  </Row>
                </Card>
              );
            })}
          </Stack>
        ) : null}
      </Stack>
    </Screen>
  );
}

type PreviewProps = {
  stepId: string;
  size: number;
  minutes: number;
  goal: number;
  label: string;
  building: boolean;
};

/** The hero element reacting to the current answer, so each step shows what it changes. */
function Preview({ stepId, size, minutes, goal, label, building }: PreviewProps) {
  const { colors } = useTheme();

  if (stepId === 'goal') {
    return (
      <Stack gap="md" align="center">
        <Dial minutes={minutes} size={Math.round(size * 0.84)}>
          <Text variant="numeral" numberOfLines={1} style={hubNumeral(Math.round(size * 0.84))}>
            {goal}
          </Text>
        </Dial>
        <GoalDots goal={goal} done={goal} size={14} />
      </Stack>
    );
  }

  const shown = building ? 0 : minutes;
  return (
    <Dial minutes={shown} size={size} color={stepId === 'plan' && !building ? colors.secondary : undefined}>
      <Text variant="numeral" numberOfLines={1} style={hubNumeral(size)}>
        {stepId === 'purpose' ? minutes : shown}
      </Text>
      <Text variant="caption" color="muted" numberOfLines={1}>
        {stepId === 'purpose' ? label : 'minutes'}
      </Text>
    </Dial>
  );
}

/** The preview numeral sized to the dial's cap, so two digits always sit inside it. */
function hubNumeral(dialSize: number) {
  const fontSize = Math.min(typography.numeral.fontSize, Math.round(dialHubRadius(dialSize) * 0.8));
  return { fontSize, lineHeight: Math.round(fontSize * 1.15), letterSpacing: -fontSize * 0.04 };
}

function PlanLine({ icon, text }: { icon: 'timer' | 'target' | 'tag'; text: string }) {
  const { colors } = useTheme();

  return (
    <Row gap="ms" align="flex-start">
      <Icon name={icon} size={20} color={colors.primary} />
      <Text style={styles.optionBody}>{text}</Text>
    </Row>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  optionBody: { flex: 1, minWidth: 0 },
  radio: { width: 24, height: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
