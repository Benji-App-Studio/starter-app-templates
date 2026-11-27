import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { Button, CountUpText, Icon, ProgressBar, Screen, Text } from '@/components';
import { onboardingSteps } from '@/config/onboarding';
import { MAX_GOAL_ML, formatAmount, recommendedGoalMl } from '@/features/hydration/goal';
import { useHydrationSettings } from '@/features/hydration/settings';
import { WaterGlass } from '@/features/hydration/WaterGlass';
import { appState, useAppState } from '@/state/appState';
import { useTheme, spacing } from '@/theme/theme';

import { PlanStep } from './PlanStep';

type OnboardingScreenProps = {
  /** Zero-based index into `onboardingSteps`. */
  step: number;
};

export function OnboardingScreen({ step }: OnboardingScreenProps) {
  const router = useRouter();
  const { colors, radii, spacing } = useTheme();
  const { onboardingAnswers } = useAppState();
  const { unit } = useHydrationSettings();
  const config = onboardingSteps[step];
  const [answer, setAnswer] = useState<string | undefined>(
    config.question ? onboardingAnswers[config.question.id] : undefined,
  );
  const [planReady, setPlanReady] = useState(false);
  const [picks, setPicks] = useState(0);
  const isLast = step === onboardingSteps.length - 1;
  const canContinue = isLast ? planReady : !config.question || answer !== undefined;

  // The goal preview includes the option being picked on this step, before Continue saves it.
  const previewAnswers =
    config.question && answer ? { ...onboardingAnswers, [config.question.id]: answer } : onboardingAnswers;
  const previewGoalMl = recommendedGoalMl(previewAnswers);

  const handlePlanReady = useCallback(() => setPlanReady(true), []);

  function handleSelect(optionId: string) {
    void Haptics.selectionAsync();
    setAnswer(optionId);
    setPicks((count) => count + 1);
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
      <ProgressBar progress={(step + 1) / onboardingSteps.length} />

      <View style={[styles.body, { paddingVertical: spacing.lg }]}>
        {isLast ? (
          <PlanStep title={config.title} body={config.body} answers={onboardingAnswers} onReady={handlePlanReady} />
        ) : step === 0 ? (
          <View style={styles.welcome}>
            {config.image ? (
              <Image source={config.image} style={styles.image} resizeMode="contain" />
            ) : (
              <WaterGlass level={0.62} size={232} />
            )}
            <Text variant="title" align="center" style={{ marginTop: spacing.xl }}>
              {config.title}
            </Text>
            <Text color="muted" align="center" style={{ marginTop: spacing.sm }}>
              {config.body}
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.preview, { marginBottom: spacing.lg, gap: spacing.md }]}>
              <WaterGlass level={previewGoalMl / MAX_GOAL_ML + 0.3} size={96} sloshKey={picks} />
              <View style={styles.previewText}>
                <View style={[styles.captionRow, { gap: spacing.sm }]}>
                  <Icon name={config.icon} size={13} color={colors.textMuted} />
                  <Text variant="caption" color="muted">
                    {answer ? 'Your goal so far' : 'Starting estimate'}
                  </Text>
                </View>
                <CountUpText
                  variant="stat"
                  color="primary"
                  value={previewGoalMl}
                  format={(value) => formatAmount(Math.round(value / 50) * 50, unit)}
                  numberOfLines={1}
                />
                <Text variant="caption" color="muted">
                  a day, updates as you answer
                </Text>
              </View>
            </View>

            <Text variant="title">{config.title}</Text>
            <Text color="muted" style={{ marginTop: spacing.sm }}>
              {config.body}
            </Text>

            {config.question ? (
              <View style={{ gap: spacing.ms, marginTop: spacing.lg }}>
                {config.question.options.map((option) => {
                  const selected = option.id === answer;
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => handleSelect(option.id)}
                      style={({ pressed }) => [
                        styles.option,
                        {
                          backgroundColor: selected ? colors.primarySoft : colors.surface,
                          borderColor: selected ? colors.primary : colors.border,
                          borderRadius: radii.lg,
                          paddingHorizontal: spacing.gutter,
                          gap: spacing.md,
                          transform: [{ scale: pressed ? 0.985 : 1 }],
                        },
                      ]}
                    >
                      <Text variant="label" color={selected ? 'primary' : 'text'} style={styles.optionLabel}>
                        {option.label}
                      </Text>
                      <View
                        style={[
                          styles.radio,
                          {
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
                })}
              </View>
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  body: { flexGrow: 1, justifyContent: 'center' },
  welcome: { alignItems: 'center' },
  captionRow: { flexDirection: 'row', alignItems: 'center' },
  preview: { flexDirection: 'row', alignItems: 'center' },
  previewText: { flex: 1, gap: spacing.sm },
  image: { width: 196, height: 196 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    borderWidth: 1.5,
  },
  optionLabel: { flex: 1 },
  radio: { width: 24, height: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
