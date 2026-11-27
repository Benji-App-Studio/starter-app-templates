import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button, ChoiceRow, Icon, ProgressBar, Screen, Stack, Text } from '@/components';
import { onboardingSteps } from '@/config/onboarding';
import { isHabitId, habits } from '@/features/quit/habits';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { PlanDetails, PlanHero, usePlanBuild } from './PlanStep';
import { StepVisual } from './StepVisual';

type OnboardingScreenProps = {
  /** Zero-based index into `onboardingSteps`. */
  step: number;
};

/**
 * One layout for every step: the progress bar, a hero area that takes the free
 * height and centers its visual, the copy, the options, then the pinned button.
 * Short steps keep the copy just above the button; long ones scroll.
 */
export function OnboardingScreen({ step }: OnboardingScreenProps) {
  const router = useRouter();
  const { colors, radii } = useTheme();
  const { onboardingAnswers } = useAppState();
  const config = onboardingSteps[step];
  const [answer, setAnswer] = useState<string | undefined>(
    config.question ? onboardingAnswers[config.question.id] : undefined,
  );
  const isLast = step === onboardingSteps.length - 1;
  const isPlan = config.id === 'plan';
  const plan = usePlanBuild(isPlan);
  const canContinue = (!config.question || answer !== undefined) && (!isPlan || plan.ready);
  // The preview reacts to the option under the finger, before Continue is pressed.
  const draftAnswers = config.question && answer ? { ...onboardingAnswers, [config.question.id]: answer } : onboardingAnswers;

  function handleContinue() {
    if (config.question && answer) {
      appState.set({ onboardingAnswers: draftAnswers });
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
      footer={<Button title={isLast ? 'Get started' : 'Continue'} onPress={handleContinue} disabled={!canContinue} />}
    >
      <Stack gap="lg" grow>
        <ProgressBar progress={(step + 1) / onboardingSteps.length} />

        <View style={styles.hero}>
          {config.image ? (
            <Image source={config.image} style={styles.image} resizeMode="contain" />
          ) : isPlan ? (
            <PlanHero answers={onboardingAnswers} progress={plan.progress} ready={plan.ready} />
          ) : (
            <StepVisual
              stepId={config.id}
              answers={draftAnswers}
              fallback={
                <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft, borderRadius: radii.pill }]}>
                  <Icon name={config.icon} size={48} color={colors.primary} />
                </View>
              }
            />
          )}
        </View>

        <Stack gap="sm">
          <Text variant="title" numberOfLines={3}>
            {config.title}
          </Text>
          <Text color="muted">{config.body}</Text>
        </Stack>

        {config.question ? (
          <Animated.View entering={FadeIn.duration(250)}>
            <Stack gap="item">
              {config.question.options.map((option) => (
                <ChoiceRow
                  key={option.id}
                  label={option.label}
                  hint={option.hint}
                  icon={config.question?.id === 'habit' && isHabitId(option.id) ? habits[option.id].icon : undefined}
                  selected={option.id === answer}
                  onPress={() => setAnswer(option.id)}
                />
              ))}
            </Stack>
          </Animated.View>
        ) : null}

        {isPlan ? <PlanDetails answers={onboardingAnswers} done={plan.done} ready={plan.ready} /> : null}
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: 220, height: 220 },
  iconWrap: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
