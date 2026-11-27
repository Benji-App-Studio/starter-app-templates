import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Button, Card, Icon, ProgressBar, Row, Screen, Stack, Text } from '@/components';
import { onboardingSteps } from '@/config/onboarding';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { OnboardingVisual } from './OnboardingVisual';

type OnboardingScreenProps = {
  /** Zero-based index into `onboardingSteps`. */
  step: number;
};

export function OnboardingScreen({ step }: OnboardingScreenProps) {
  const router = useRouter();
  const { colors, radii } = useTheme();
  const { onboardingAnswers } = useAppState();
  const config = onboardingSteps[step];
  const isLast = step === onboardingSteps.length - 1;
  const [answer, setAnswer] = useState<string | undefined>(
    config.question ? onboardingAnswers[config.question.id] : undefined,
  );
  const [built, setBuilt] = useState(!isLast);
  const canContinue = built && (!config.question || answer !== undefined);
  const previewAnswers =
    config.question && answer ? { ...onboardingAnswers, [config.question.id]: answer } : onboardingAnswers;

  const handleBuilt = useCallback(() => setBuilt(true), []);

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

  const copy = (
    <Animated.View entering={FadeInDown.delay(80).springify().damping(18)}>
      <Stack gap="sm">
        <Text variant="title" numberOfLines={3}>
          {config.title}
        </Text>
        <Text color="muted">{config.body}</Text>
      </Stack>
    </Animated.View>
  );
  // The plan step draws its own copy between the ring and the plan lines.
  const visualHoldsCopy = isLast && !config.image;

  // One layout for every step: progress row, a hero area that takes the free space and centres
  // its picture, the copy and the options under it, then the pinned button.
  return (
    <Screen
      scroll
      contentStyle={styles.content}
      footer={
        <Button title={isLast ? 'Get started' : 'Continue'} onPress={handleContinue} disabled={!canContinue} />
      }
    >
      <Stack gap="lg" style={styles.grow}>
        <Row gap="md">
          {step > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => router.back()}
              hitSlop={BACK_SLOP}
              style={styles.back}
            >
              <Icon name="chevron" size={16} color={colors.textMuted} style={styles.backIcon} />
            </Pressable>
          ) : (
            <View style={styles.back} />
          )}
          <View style={styles.bar}>
            <ProgressBar
              progress={(step + 1) / onboardingSteps.length}
              accessibilityLabel={`Step ${step + 1} of ${onboardingSteps.length}`}
            />
          </View>
          <Text variant="caption" color="muted" style={styles.tabular}>
            {step + 1}/{onboardingSteps.length}
          </Text>
        </Row>

        <Animated.View entering={FadeIn.duration(350)} style={styles.hero}>
          {config.image ? (
            <Image source={config.image} style={styles.image} resizeMode="contain" />
          ) : (
            <OnboardingVisual stepId={config.id} answers={previewAnswers} onBuilt={handleBuilt}>
              {visualHoldsCopy ? copy : null}
            </OnboardingVisual>
          )}
        </Animated.View>

        {visualHoldsCopy ? null : copy}

        {config.question ? (
          <Stack gap="ms">
            {config.question.options.map((option, index) => {
              const selected = option.id === answer;
              return (
                <Animated.View key={option.id} entering={FadeInDown.delay(120 + index * 50).springify().damping(18)}>
                  <Card selected={selected} onPress={() => setAnswer(option.id)}>
                    <Row gap="ms" style={styles.option}>
                      <Stack gap="xs" fill>
                        <Text variant="label" numberOfLines={2}>
                          {option.label}
                        </Text>
                        {option.detail ? (
                          <Text variant="caption" color="muted" numberOfLines={1}>
                            {option.detail}
                          </Text>
                        ) : null}
                      </Stack>
                      <View
                        style={[
                          styles.tick,
                          {
                            borderRadius: radii.pill,
                            borderColor: selected ? colors.primary : colors.border,
                            backgroundColor: selected ? colors.primary : 'transparent',
                          },
                        ]}
                      >
                        {selected ? <Icon name="checkSmall" size={13} color={colors.onPrimary} weight="bold" /> : null}
                      </View>
                    </Row>
                  </Card>
                </Animated.View>
              );
            })}
          </Stack>
        ) : null}
      </Stack>
    </Screen>
  );
}

// The chevron is 32 pt; the slop makes the touch target 52 pt.
const BACK_SLOP = 10;

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon: { transform: [{ scaleX: -1 }] },
  bar: { flex: 1 },
  // flexGrow, not flex: the hero keeps its own height when a long step scrolls.
  grow: { flexGrow: 1 },
  hero: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: 220, height: 220 },
  option: { minHeight: 32 },
  tick: { width: 24, height: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tabular: { fontVariant: ['tabular-nums'] },
});
