import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, TextInput, View } from 'react-native';

import { Button, Text } from '@/components';
import { createMix } from '@/db/mixes';
import { useTheme } from '@/theme/theme';

import { useMixer } from './engine';
import { formatTimer } from './format';
import { describeMix, soundById } from './sounds';

/** Name the current mix and keep it. */
export function SaveMixSheet() {
  const router = useRouter();
  const { colors, radii, spacing, typography } = useTheme();
  const { sounds, timerMinutes } = useMixer();
  const [name, setName] = useState(describeMix(sounds));
  const [saving, setSaving] = useState(false);
  const trimmed = name.trim();

  async function handleSave() {
    setSaving(true);
    try {
      await createMix(trimmed, sounds, timerMinutes);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert('Could not save', 'Please try again.');
      setSaving(false);
    }
  }

  return (
    <View style={{ backgroundColor: colors.surface, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <Text variant="heading">Save this mix</Text>
        <Text color="muted">
          {sounds.map((entry) => soundById[entry.id].name).join(', ')} · timer {formatTimer(timerMinutes).toLowerCase()}
        </Text>
      </View>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name the mix"
        placeholderTextColor={colors.textMuted}
        autoFocus
        selectTextOnFocus
        returnKeyType="done"
        onSubmitEditing={trimmed ? handleSave : undefined}
        maxLength={40}
        style={[
          typography.heading,
          {
            color: colors.text,
            backgroundColor: colors.surfaceRaised,
            borderRadius: radii.md,
            borderCurve: 'continuous',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
          },
        ]}
      />

      <Button title="Save mix" onPress={handleSave} disabled={!trimmed} loading={saving} />
    </View>
  );
}
