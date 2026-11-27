import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Button, Card, ProgressDots, Screen, Text } from '@/components';
import { onboardingSteps } from '@/config/onboarding';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

type OnboardingScreenProps = {
  /** Zero-based index into `onboardingSteps`. */
  step: number;
};

export function OnboardingScreen({ step }: OnboardingScreenProps) {
  const router = useRouter();
  const { colors, radii, spacing } = useTheme();
  const { onboardingAnswers } = useAppState();
  const config = onboardingSteps[step];
  const [answer, setAnswer] = useState<string | undefined>(
    config.question ? onboardingAnswers[config.question.id] : undefined,
  );
  const isLast = step === onboardingSteps.length - 1;
  const canContinue = !config.question || answer !== undefined;

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
        <View style={{ gap: spacing.md }}>
          <ProgressDots count={onboardingSteps.length} current={step} />
          <Button
            title={isLast ? 'Get started' : 'Continue'}
            onPress={handleContinue}
            disabled={!canContinue}
          />
        </View>
      }
    >
      <View style={[styles.illustration, { marginVertical: spacing.xl }]}>
        {config.image ? (
          <Image source={config.image} style={styles.image} resizeMode="contain" />
        ) : (
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: colors.primarySoft, borderRadius: radii.pill },
            ]}
          >
            <Ionicons name={config.icon} size={56} color={colors.primary} />
          </View>
        )}
      </View>

      <Text variant="title" align="center">
        {config.title}
      </Text>
      <Text color="muted" align="center" style={{ marginTop: spacing.sm }}>
        {config.body}
      </Text>

      {config.question ? (
        <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
          {config.question.options.map((option) => (
            <Card
              key={option.id}
              selected={option.id === answer}
              onPress={() => setAnswer(option.id)}
            >
              <Text variant="label">{option.label}</Text>
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  illustration: { alignItems: 'center' },
  image: { width: 220, height: 220 },
  iconWrap: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
