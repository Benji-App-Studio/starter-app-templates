import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, Card, Icon, ProgressBar, Screen, Text } from '@/components';
import { onboardingSteps } from '@/config/onboarding';
import { createHabit } from '@/db/habits';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { checkinFor, startersFor, starterToHabit } from '../habits/starters';
import { PlanStep } from './PlanStep';
import { StepVisual } from './StepVisual';

type OnboardingScreenProps = {
  /** Zero-based index into `onboardingSteps`. */
  step: number;
};

export function OnboardingScreen({ step }: OnboardingScreenProps) {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { onboardingAnswers } = useAppState();
  const config = onboardingSteps[step];
  const [answer, setAnswer] = useState<string | undefined>(
    config.question ? onboardingAnswers[config.question.id] : undefined,
  );
  const isLast = step === onboardingSteps.length - 1;
  const starters = startersFor(onboardingAnswers);
  const checkin = checkinFor(onboardingAnswers);
  const [selectedStarters, setSelectedStarters] = useState(() => starters.map(() => true));
  const [planReady, setPlanReady] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const canContinue = isLast ? planReady && !finishing : !config.question || answer !== undefined;

  const handlePlanReady = useCallback(() => setPlanReady(true), []);

  function choose(optionId: string) {
    void Haptics.selectionAsync();
    setAnswer(optionId);
  }

  async function finish() {
    setFinishing(true);
    for (const [index, starter] of starters.entries()) {
      if (selectedStarters[index]) {
        await createHabit(starterToHabit(starter, checkin.time));
      }
    }
    appState.set({ onboardingDone: true });
  }

  function handleContinue() {
    if (config.question && answer) {
      appState.set({ onboardingAnswers: { ...onboardingAnswers, [config.question.id]: answer } });
    }
    if (isLast) {
      void finish();
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
          loading={finishing}
        />
      }
    >
      <View style={{ paddingTop: spacing.sm }}>
        <ProgressBar
          value={(step + 1) / onboardingSteps.length}
          height={4}
          accessibilityLabel={`Step ${step + 1} of ${onboardingSteps.length}`}
        />
      </View>

      {/* The step's block is centred in the space above the CTA, so short steps never leave a dead lower half. */}
      <View style={[styles.body, { paddingVertical: spacing.lg }]}>
        {isLast ? null : (
          <View style={[styles.visual, { marginBottom: spacing.xl }]}>
            <StepVisual stepId={config.id} answer={answer} />
          </View>
        )}

        <View style={{ gap: spacing.sm }}>
          <Text variant="title">{config.title}</Text>
          <Text color="muted">{config.body}</Text>
        </View>

        {config.question ? (
          <View style={{ gap: spacing.item, marginTop: spacing.lg }}>
            {config.question.options.map((option, index) => {
              const selected = option.id === answer;
              return (
                <Animated.View
                  key={option.id}
                  entering={FadeInDown.delay(index * 50)
                    .springify()
                    .damping(18)}
                >
                  <Card selected={selected} onPress={() => choose(option.id)}>
                    <View style={[styles.option, { gap: spacing.md }]}>
                      <Text variant="label" style={styles.optionLabel}>
                        {option.label}
                      </Text>
                      <View
                        style={[
                          styles.radio,
                          {
                            borderColor: selected ? colors.primary : colors.border,
                            backgroundColor: selected ? colors.primary : 'transparent',
                          },
                        ]}
                      >
                        {selected ? <Icon name="check" size={13} color={colors.onPrimary} weight="bold" /> : null}
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              );
            })}
          </View>
        ) : null}

        {isLast ? (
          <View style={{ marginTop: spacing.lg }}>
            <PlanStep
              starters={starters}
              selected={selectedStarters}
              onToggle={(index) =>
                setSelectedStarters((current) => current.map((value, i) => (i === index ? !value : value)))
              }
              checkinLabel={checkin.label}
              reminderTime={checkin.time}
              onReady={handlePlanReady}
            />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  body: { flexGrow: 1, justifyContent: 'center' },
  visual: { alignItems: 'center', minHeight: 176, justifyContent: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 32 },
  optionLabel: { flex: 1 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
