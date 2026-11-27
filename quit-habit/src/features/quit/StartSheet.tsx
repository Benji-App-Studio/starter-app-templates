import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Row, Stack, Stepper, Text } from '@/components';
import { startAttempt } from '@/db/attempts';
import { useTheme } from '@/theme/theme';

import { habits } from './habits';
import { useProfile } from './profile';
import { DAY_MS } from './time';

const quickPicks = [
  { daysAgo: 0, label: 'Just now' },
  { daysAgo: 1, label: 'Yesterday' },
  { daysAgo: 3, label: '3 days ago' },
  { daysAgo: 7, label: 'A week ago' },
];

/** Bottom sheet: when did the user stop? Starts the first attempt. */
export function StartSheet() {
  const router = useRouter();
  const { colors, radii, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const [daysAgo, setDaysAgo] = useState(0);
  const [saving, setSaving] = useState(false);

  async function handleStart() {
    if (!profile) {
      return;
    }
    setSaving(true);
    await startAttempt(Date.now() - daysAgo * DAY_MS, profile.unitsPerDay, profile.costPerDay);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  const habit = profile ? habits[profile.habit] : undefined;

  return (
    <View
      style={{
        paddingHorizontal: spacing.gutter,
        paddingTop: spacing.xl,
        paddingBottom: insets.bottom + spacing.md,
        gap: spacing.lg,
        backgroundColor: colors.background,
      }}
    >
      <Stack gap="sm">
        <Text variant="title">When did you stop?</Text>
        <Text color="muted">
          {habit ? `The ${habit.freeLabel.toLowerCase()} counter starts from that moment.` : 'The counter starts from that moment.'}
        </Text>
      </Stack>

      <Row gap="sm" wrap>
        {quickPicks.map((pick) => {
          const selected = pick.daysAgo === daysAgo;
          return (
            <Pressable
              key={pick.daysAgo}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => {
                void Haptics.selectionAsync();
                setDaysAgo(pick.daysAgo);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <Text variant="label" color={selected ? 'onPrimary' : 'text'}>
                {pick.label}
              </Text>
            </Pressable>
          );
        })}
      </Row>

      <Row gap="md">
        <Text variant="label" numberOfLines={2} style={styles.grow}>
          Or pick the day
        </Text>
        <Stepper
          value={daysAgo}
          label={daysAgo === 0 ? 'Today' : `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`}
          step={1}
          min={0}
          max={3650}
          onChange={setDaysAgo}
        />
      </Row>

      <Button title="Start my counter" icon="timer" onPress={handleStart} loading={saving} disabled={!profile} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { minHeight: 44, justifyContent: 'center', borderWidth: 1.5 },
  grow: { flex: 1, minWidth: 0 },
});
