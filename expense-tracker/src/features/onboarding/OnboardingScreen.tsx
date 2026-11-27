import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Button, Icon, Screen, Stack, Text } from '@/components';
import { onboardingSteps, type OnboardingOption } from '@/config/onboarding';
import { WelcomeIllustration } from '@/features/expenses/illustrations';
import { preferences, usePreferences } from '@/features/expenses/preferences';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { PlanStep } from './PlanStep';
import { PlanPreview } from './PlanPreview';

type OnboardingScreenProps = {
  /** Zero-based index into `onboardingSteps`. */
  step: number;
};

export function OnboardingScreen({ step }: OnboardingScreenProps) {
  const router = useRouter();
  const { spacing } = useTheme();
  const { currency } = usePreferences();
  const { onboardingAnswers } = useAppState();
  const config = onboardingSteps[step];
  const [answer, setAnswer] = useState<string | undefined>(
    config.question ? onboardingAnswers[config.question.id] : undefined,
  );
  const [planReady, setPlanReady] = useState(false);
  const isLast = step === onboardingSteps.length - 1;
  const canContinue = config.plan ? planReady : !config.question || answer !== undefined;
  const previewAnswers = config.question && answer ? { ...onboardingAnswers, [config.question.id]: answer } : onboardingAnswers;
  const handlePlanReady = useCallback(() => setPlanReady(true), []);

  function handleContinue() {
    if (config.question && answer) {
      appState.set({ onboardingAnswers: { ...onboardingAnswers, [config.question.id]: answer } });
    }
    if (isLast) {
      preferences.set({ startedAt: Date.now() });
      appState.set({ onboardingDone: true });
      return;
    }
    router.push(`/${step + 1}`);
  }

  function choose(option: OnboardingOption) {
    void Haptics.selectionAsync();
    setAnswer(option.id);
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
      <StepProgress count={onboardingSteps.length} current={step} />

      {config.question || config.plan ? (
        <Stack gap="lg" style={{ marginTop: spacing.xl }}>
          <Stack gap="sm">
            <Text variant="title" numberOfLines={3}>
              {config.title}
            </Text>
            <Text color="muted">{config.body}</Text>
          </Stack>

          {config.plan ? (
            <PlanStep answers={onboardingAnswers} currency={currency} onReady={handlePlanReady} />
          ) : (
            <PlanPreview answers={previewAnswers} currency={currency} />
          )}

          {config.question ? (
            <Stack gap="item">
              {config.question.options.map((option) => (
                <OptionRow
                  key={option.id}
                  label={option.label}
                  selected={option.id === answer}
                  onPress={() => choose(option)}
                />
              ))}
            </Stack>
          ) : null}
        </Stack>
      ) : (
        // A step without a question: the picture owns the space, the copy sits just above the CTA.
        <>
          <View style={styles.hero}>
            {config.image ? (
              <Image source={config.image} style={styles.image} resizeMode="contain" />
            ) : (
              <WelcomeIllustration />
            )}
          </View>
          <Stack gap="sm">
            <Text variant="display" numberOfLines={3}>
              {config.title}
            </Text>
            <Text color="muted">{config.body}</Text>
          </Stack>
        </>
      )}
    </Screen>
  );
}

type OptionRowProps = { label: string; selected: boolean; onPress: () => void };

/** A large single-choice row: the whole row is the target, the dot on the right shows the pick. */
function OptionRow({ label, selected, onPress }: OptionRowProps) {
  const { colors, radii, sizes, spacing } = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          minHeight: sizes.button + spacing.xs,
          backgroundColor: selected ? colors.primarySoft : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: radii.lg,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.item,
          gap: spacing.md,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text variant="label" style={styles.optionLabel}>
        {label}
      </Text>
      <View
        style={[
          styles.radio,
          {
            width: sizes.check,
            height: sizes.check,
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : 'transparent',
            borderRadius: radii.pill,
          },
        ]}
      >
        {selected ? <Icon name="check" size={12} color={colors.onPrimary} weight="bold" /> : null}
      </View>
    </Pressable>
  );
}

type StepProgressProps = { count: number; current: number };

/** Thin bar at the top that springs forward one step at a time. */
function StepProgress({ count, current }: StepProgressProps) {
  const { colors, radii } = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(current / count);
  const target = (current + 1) / count;

  useEffect(() => {
    progress.value = reduceMotion ? target : withSpring(target, { damping: 20, stiffness: 120 });
  }, [progress, reduceMotion, target]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View
      accessibilityLabel={`Step ${current + 1} of ${count}`}
      style={[styles.track, { backgroundColor: colors.track, borderRadius: radii.pill }]}
    >
      <Animated.View style={[styles.fill, fillStyle, { backgroundColor: colors.primary, borderRadius: radii.pill }]} />
    </View>
  );
}

const ILLUSTRATION_SIZE = 240;

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: ILLUSTRATION_SIZE, height: ILLUSTRATION_SIZE },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  optionLabel: { flex: 1, minWidth: 0 },
  radio: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  track: { height: 4, overflow: 'hidden' },
  fill: { height: '100%' },
});
