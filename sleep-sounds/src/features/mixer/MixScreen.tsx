import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Icon, Screen, Text } from '@/components';
import { useAppState } from '@/state/appState';
import { spacing, useTheme } from '@/theme/theme';

import { Blob } from './Blob';
import { HeroCaption } from './HeroCaption';
import { mixer, useMixer } from './engine';
import { formatCountdown, formatTimer } from './format';
import { buildNightPlan } from './plan';
import { SoundTile } from './SoundTile';
import { describeMix, soundById, sounds } from './sounds';

const PLAY_SIZE = 76;

/** The mixer: the breathing blob with the timer in it, play, and the eight sounds. */
export function MixScreen() {
  const router = useRouter();
  const { colors, radii, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const { onboardingAnswers, timerMinutes: defaultTimer } = useAppState();
  const { sounds: mix, playing, timerMinutes, remainingSeconds } = useMixer();

  useEffect(() => {
    mixer.seed(buildNightPlan(onboardingAnswers).sounds, defaultTimer);
  }, [onboardingAnswers, defaultTimer]);

  const hasSounds = mix.length > 0;
  const tints = mix.map((entry) => soundById[entry.id].tint);
  const energy = hasSounds ? Math.min(1, (playing ? 0.55 : 0.2) + mix.length * 0.1) : 0;
  const blobSize = Math.min(width - spacing.md * 2, 340);

  function handlePlay() {
    if (playing) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      mixer.pause();
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void mixer.play();
  }

  const rows = [sounds.slice(0, 4), sounds.slice(4)];

  return (
    <Screen scroll tabs edges={['top']} contentStyle={{ gap: spacing.md }}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="caption" color="muted">
            Tonight
          </Text>
          <Text variant="heading" numberOfLines={1}>
            {hasSounds ? describeMix(mix) : 'Pick a sound to begin'}
          </Text>
        </View>
        <RoundButton
          icon="bookmarkOutline"
          label="Save mix"
          disabled={!hasSounds}
          onPress={() => router.push('/save-mix')}
        />
      </View>

      <View style={[styles.hero, { height: blobSize }]}>
        <Blob tints={tints} energy={energy} size={blobSize} style={StyleSheet.absoluteFill} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sleep timer, ${formatTimer(timerMinutes)}`}
          onPress={() => router.push('/timer?target=tonight')}
          style={({ pressed }) => [styles.dialCenter, { opacity: pressed ? 0.7 : 1 }]}
        >
          {playing && remainingSeconds !== null ? (
            <Animated.View key="countdown" entering={FadeIn} exiting={FadeOut} style={styles.center}>
              <Text variant="numeral" tabular>
                {formatCountdown(remainingSeconds)}
              </Text>
              <HeroCaption>
                until it fades out
              </HeroCaption>
            </Animated.View>
          ) : playing ? (
            <Animated.View key="allnight" entering={FadeIn} exiting={FadeOut} style={styles.center}>
              <Text variant="display">All night</Text>
              <HeroCaption>
                until you stop it
              </HeroCaption>
            </Animated.View>
          ) : (
            <Animated.View key="setting" entering={FadeIn} exiting={FadeOut} style={styles.center}>
              <Text variant="numeral" tabular>
                {timerMinutes === null ? '∞' : timerMinutes}
              </Text>
              <HeroCaption>
                {timerMinutes === null ? 'plays all night' : 'minutes, then silence'}
              </HeroCaption>
            </Animated.View>
          )}
        </Pressable>
      </View>

      <View style={[styles.controls, { gap: spacing.lg }]}>
        <RoundButton
          icon="timer"
          label={`Timer, ${formatTimer(timerMinutes)}`}
          onPress={() => router.push('/timer?target=tonight')}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause' : 'Play'}
          accessibilityState={{ disabled: !hasSounds }}
          disabled={!hasSounds}
          onPress={handlePlay}
          style={({ pressed }) => [
            styles.play,
            {
              backgroundColor: colors.primary,
              borderRadius: radii.pill,
              opacity: !hasSounds ? 0.35 : pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          <Icon
            name={playing ? 'pause' : 'play'}
            size={30}
            color={colors.onPrimary}
            weight="semibold"
            style={playing ? undefined : { marginLeft: 3 }}
          />
        </Pressable>
        <RoundButton
          icon="trash"
          label="Clear mix"
          disabled={!hasSounds}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            mixer.clear();
          }}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        {rows.map((row, index) => (
          <View key={index} style={[styles.row, { gap: spacing.sm }]}>
            {row.map((sound) => (
              <SoundTile
                key={sound.id}
                sound={sound}
                volume={mix.find((entry) => entry.id === sound.id)?.volume}
                onToggle={() => mixer.toggle(sound.id)}
                onVolume={(volume) => mixer.setVolume(sound.id, volume)}
              />
            ))}
          </View>
        ))}
      </View>

      <Text variant="caption" color="muted" align="center">
        Tap a sound to add it. Hold and drag up or down to set its level.
      </Text>
    </Screen>
  );
}

type RoundButtonProps = {
  icon: 'bookmarkOutline' | 'timer' | 'trash';
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function RoundButton({ icon, label, onPress, disabled = false }: RoundButtonProps) {
  const { colors, radii } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.round,
        {
          backgroundColor: colors.surface,
          borderRadius: radii.pill,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <Icon name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.item },
  headerText: { flex: 1, gap: spacing.sm },
  hero: { alignItems: 'center', justifyContent: 'center' },
  dialCenter: { alignItems: 'center', justifyContent: 'center', minWidth: 200, minHeight: 120 },
  center: { alignItems: 'center', gap: spacing.sm },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  play: { width: PLAY_SIZE, height: PLAY_SIZE, alignItems: 'center', justifyContent: 'center' },
  round: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
});
