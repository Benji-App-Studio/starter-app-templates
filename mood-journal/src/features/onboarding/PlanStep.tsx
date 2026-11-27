import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Card, Icon, Row, Stack, Text, type IconName } from '@/components';
import { formatHour } from '@/features/journal/dates';
import { Plant } from '@/features/journal/Plant';
import { notePromptFor } from '@/features/journal/prompts';
import { defaultReminderHour } from '@/features/reminders/reminders';
import { useTheme } from '@/theme/theme';

type PlanStepProps = {
  answers: Record<string, string>;
};

/** Four lines at this pace is about 1.5 s: long enough to read, short enough not to be theatre. */
const REVEAL_MS = 380;

/**
 * The last onboarding step: the plan the answers add up to, revealed line by
 * line. The lines are the real settings the app will use, not a promise.
 */
export function PlanStep({ answers }: PlanStepProps) {
  const { colors, radii, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const hour = formatHour(defaultReminderHour(answers.checkInTime));
  const prompt = notePromptFor(answers.focus);
  const lines: { icon: IconName; title: string; body: string }[] = [
    { icon: 'face', title: 'One slide a day', body: 'Awful to great, and the screen takes your color.' },
    { icon: 'quote', title: 'Your prompt', body: prompt.planLine },
    { icon: 'bell', title: `Check-in at ${hour}`, body: 'Turn the reminder on in Settings when you want it.' },
    { icon: 'calendar', title: 'A year in pixels', body: 'Today becomes the first colored square.' },
  ];
  const [revealed, setRevealed] = useState(reducedMotion ? lines.length : 0);
  const building = revealed < lines.length;

  useEffect(() => {
    if (!building) {
      return;
    }
    const timer = setTimeout(() => setRevealed((count) => count + 1), REVEAL_MS);
    return () => clearTimeout(timer);
  }, [building, revealed]);

  return (
    <>
      <View style={[styles.hero, { paddingVertical: spacing.md }]}>
        <Plant stage={building ? 0 : 1} size={120} />
      </View>
      <Animated.View key={building ? 'building' : 'ready'} entering={FadeIn.duration(220)}>
        <Stack gap="sm">
          <Text variant="title" numberOfLines={2}>
            {building ? 'Putting your journal together' : 'Your journal is ready'}
          </Text>
          <Text color="muted">
            {building ? 'Reading your answers.' : `A ${hour} check-in, your own prompt, and a seed that grows with every day you write.`}
          </Text>
        </Stack>
      </Animated.View>
      <Stack gap="ms">
        {lines.slice(0, revealed).map((line) => (
          <Animated.View key={line.title} entering={reducedMotion ? undefined : FadeInDown.springify().damping(18)}>
            <Card>
              <Row gap="md">
                <View style={[styles.badge, { backgroundColor: colors.primarySoft, borderRadius: radii.pill }]}>
                  <Icon name={line.icon} size={18} color={colors.primary} />
                </View>
                <Stack gap="xs" style={styles.flex}>
                  <Text variant="label" numberOfLines={1}>
                    {line.title}
                  </Text>
                  <Text variant="caption" color="muted" numberOfLines={2}>
                    {line.body}
                  </Text>
                </Stack>
              </Row>
            </Card>
          </Animated.View>
        ))}
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, minWidth: 0 },
  badge: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
