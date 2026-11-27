import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Chip, Text } from '@/components';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { mixer, useMixer } from './engine';
import { TimerDial } from './TimerDial';

const QUICK_PICKS: (number | null)[] = [null, 15, 30, 45, 60, 90];

type TimerSheetProps = {
  /** `tonight` sets the running mixer; `default` sets what every new mix starts with. */
  target: 'tonight' | 'default';
};

/** The sleep-timer sheet: a dial to drag, quick picks underneath, one button to set it. */
export function TimerSheet({ target }: TimerSheetProps) {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { timerMinutes: mixerMinutes } = useMixer();
  const { timerMinutes: defaultMinutes } = useAppState();
  const [minutes, setMinutes] = useState<number | null>(
    target === 'tonight' ? mixerMinutes : defaultMinutes,
  );

  function handleSet() {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (target === 'tonight') {
      mixer.setTimer(minutes);
    } else {
      appState.set({ timerMinutes: minutes });
    }
    router.back();
  }

  return (
    <View style={{ backgroundColor: colors.surface, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg }}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="heading">{target === 'tonight' ? 'Sleep timer' : 'Default sleep timer'}</Text>
        <Text color="muted">
          {target === 'tonight'
            ? 'The mix fades out and stops when the time is up.'
            : 'Every mix starts with this timer. You can still change it for the night.'}
        </Text>
      </View>

      <View style={styles.dial}>
        <TimerDial minutes={minutes} onChange={setMinutes} />
      </View>

      <View style={[styles.picks, { gap: spacing.sm }]}>
        {QUICK_PICKS.map((pick) => (
          <Chip
            key={pick ?? 'off'}
            label={pick === null ? 'Off' : `${pick}`}
            selected={pick === minutes}
            onPress={() => setMinutes(pick)}
          />
        ))}
      </View>

      <Button
        title={minutes === null ? 'Play until I stop it' : `Fade out after ${minutes} minutes`}
        onPress={handleSet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dial: { alignItems: 'center' },
  picks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
