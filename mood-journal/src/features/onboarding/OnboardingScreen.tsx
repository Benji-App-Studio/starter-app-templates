import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useSharedValue } from 'react-native-reanimated';

import { Button, Icon, ProgressDots, Row, Screen, Stack, Text } from '@/components';
import type { MoodScore } from '@/db/checkIns';
import { onboardingSteps, type CheckInTimeAnswer, type OnboardingQuestion } from '@/config/onboarding';
import { SkyArc } from '@/features/journal/Illustrations';
import { MoodDial } from '@/features/journal/MoodDial';
import { moodFor } from '@/features/journal/moods';
import { notePromptFor } from '@/features/journal/prompts';
import { useMoodTint } from '@/features/journal/useMoodTint';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { PlanStep } from './PlanStep';

type OnboardingScreenProps = {
  /** Zero-based index into `onboardingSteps`. */
  step: number;
};

const TIMES: readonly CheckInTimeAnswer[] = ['morning', 'midday', 'evening', 'night'];

function isTime(value: string | undefined): value is CheckInTimeAnswer {
  return TIMES.some((time) => time === value);
}

/**
 * One layout for every step: the progress bar, a hero that fills the space
 * above the copy (and reacts to the answer), the copy and options, then the
 * pinned button. The welcome step lets you try the mood dial right away.
 */
export function OnboardingScreen({ step }: OnboardingScreenProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { spacing } = useTheme();
  const { onboardingAnswers } = useAppState();
  const config = onboardingSteps[step];
  const [answer, setAnswer] = useState<string | undefined>(
    config.question ? onboardingAnswers[config.question.id] : undefined,
  );
  const progress = useSharedValue(0.5);
  const tint = useMoodTint(progress);
  const [tried, setTried] = useState<MoodScore>();
  const isLast = step === onboardingSteps.length - 1;
  const isWelcome = config.id === 'welcome';
  const canContinue = !config.question || answer !== undefined;
  const heroWidth = width - spacing.gutter * 2;

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

  let hero: ReactNode;
  if (config.image) {
    hero = <Image source={config.image} style={styles.image} resizeMode="contain" />;
  } else if (isWelcome) {
    hero = (
      <Stack gap="sm" align="center">
        <MoodDial progress={progress} width={heroWidth} onScoreChange={setTried} onCommit={setTried} />
        <Animated.View key={tried ?? 'hint'} entering={FadeIn.duration(180)}>
          <Text variant="display" align="center" numberOfLines={1}>
            {tried ? moodFor(tried).label : 'Try it'}
          </Text>
        </Animated.View>
        <Text variant="caption" color="muted" align="center">
          {tried ? 'The whole screen takes on your mood' : 'Drag the face along the arc'}
        </Text>
      </Stack>
    );
  } else if (config.id === 'checkInTime') {
    hero = (
      <Animated.View key={answer ?? 'none'} entering={FadeIn.duration(260)}>
        <SkyArc time={isTime(answer) ? answer : undefined} width={heroWidth} />
      </Animated.View>
    );
  } else if (config.id === 'focus') {
    hero = <PromptPreview answer={answer} />;
  } else {
    hero = <Icon name={config.icon} size={64} />;
  }

  const footer = (
    <Button title={isLast ? 'Start journaling' : 'Continue'} onPress={handleContinue} disabled={!canContinue} />
  );

  const body = isLast ? (
    <>
      <ProgressDots count={onboardingSteps.length} current={step} />
      <PlanStep answers={onboardingAnswers} />
    </>
  ) : (
    <>
      <ProgressDots count={onboardingSteps.length} current={step} />
      <View style={[styles.hero, { paddingVertical: spacing.lg }]}>{hero}</View>
      <Stack gap="sm">
        <Text variant="title" numberOfLines={3}>
          {config.title}
        </Text>
        <Text color="muted">{config.body}</Text>
      </Stack>
      {config.question ? <Options question={config.question} answer={answer} onChoose={setAnswer} /> : null}
    </>
  );

  if (!isWelcome) {
    return (
      <Screen scroll gap="lg" footer={footer}>
        {body}
      </Screen>
    );
  }

  return (
    <Animated.View style={[styles.root, tint]}>
      <Screen scroll gap="lg" footer={footer} backgroundColor="transparent">
        {body}
      </Screen>
    </Animated.View>
  );
}

function Options({
  question,
  answer,
  onChoose,
}: {
  question: OnboardingQuestion;
  answer: string | undefined;
  onChoose: (id: string) => void;
}) {
  const { colors, radii, spacing, layout } = useTheme();

  return (
    <Stack gap="ms">
      {question.options.map((option) => {
        const selected = option.id === answer;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              void Haptics.selectionAsync();
              onChoose(option.id);
            }}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: selected ? colors.primarySoft : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
                borderWidth: layout.border,
                borderRadius: radii.lg,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.ms,
                gap: spacing.md,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
          >
            <Text variant="label" numberOfLines={2} style={styles.flex}>
              {option.label}
            </Text>
            <View
              style={[
                styles.radio,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderRadius: radii.pill,
                },
              ]}
            >
              {selected ? <Icon name="check" size={12} color={colors.onPrimary} weight="bold" /> : null}
            </View>
          </Pressable>
        );
      })}
    </Stack>
  );
}

/** A page of the journal with the prompt this answer sets, so the choice shows its effect. */
function PromptPreview({ answer }: { answer: string | undefined }) {
  const { colors, radii, spacing, layout } = useTheme();
  const prompt = notePromptFor(answer);

  return (
    <Animated.View
      key={answer ?? 'none'}
      entering={FadeInDown.springify().damping(18)}
      style={[
        styles.page,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: layout.hairline,
          borderRadius: radii.lg,
          padding: spacing.gutter,
          gap: spacing.ms,
        },
      ]}
    >
      <Row gap="sm">
        <Icon name="quote" size={16} color={colors.primary} />
        <Text variant="eyebrow" color="muted" numberOfLines={1}>
          {answer ? 'YOUR DAILY PROMPT' : 'A DAILY PROMPT'}
        </Text>
      </Row>
      <Text variant="journal" color={answer ? 'text' : 'muted'} numberOfLines={2}>
        {prompt.placeholder[prompt.defaultKind]}
      </Text>
      <Stack gap="ms">
        {[1, 0.8, 0.55].map((fraction) => (
          <View key={fraction} style={[styles.rule, { width: `${fraction * 100}%`, backgroundColor: colors.border }]} />
        ))}
      </Stack>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1, minWidth: 0 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: 240, height: 240 },
  page: { alignSelf: 'stretch' },
  rule: { height: 1 },
  option: { minHeight: 60, flexDirection: 'row', alignItems: 'center' },
  radio: { width: 24, height: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
