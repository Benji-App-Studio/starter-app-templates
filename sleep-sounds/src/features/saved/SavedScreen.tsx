import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Card, EmptyState, Icon, NightIllustration, Screen, Text } from '@/components';
import { deleteMix, listMixes, type Mix } from '@/db/mixes';
import { mixer, useMixer } from '@/features/mixer/engine';
import { formatTimer } from '@/features/mixer/format';
import { soundById } from '@/features/mixer/sounds';
import { spacing, useTheme } from '@/theme/theme';

/** Saved mixes: one tap starts the same night again. */
export function SavedScreen() {
  const router = useRouter();
  const { colors, radii, spacing } = useTheme();
  const { playing, sounds } = useMixer();
  const [mixes, setMixes] = useState<Mix[]>();

  useFocusEffect(
    useCallback(() => {
      listMixes().then(setMixes);
    }, []),
  );

  function handlePlay(mix: Mix) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isCurrent(mix) && playing) {
      mixer.pause();
      return;
    }
    mixer.load(mix.sounds, mix.timerMinutes);
    void mixer.play();
    router.navigate('/');
  }

  function isCurrent(mix: Mix) {
    return (
      mix.sounds.length === sounds.length &&
      mix.sounds.every((entry) => sounds.some((current) => current.id === entry.id))
    );
  }

  function handleDelete(mix: Mix) {
    Alert.alert(`Delete “${mix.name}”?`, 'The sounds stay in the library; only the saved mix goes.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMix(mix.id);
          setMixes((current) => current?.filter((entry) => entry.id !== mix.id));
        },
      },
    ]);
  }

  if (!mixes) {
    return <Screen edges={['top']} title="Saved mixes">{null}</Screen>;
  }

  if (mixes.length === 0) {
    return (
      <Screen scroll tabs edges={['top']} title="Saved mixes" contentStyle={styles.grow}>
        <EmptyState
          illustration={<NightIllustration kind="stars" />}
          title="No saved mixes yet"
          body="Build a mix you like, then press the bookmark on the mixer to keep it here."
          action={{ title: 'Open the mixer', onPress: () => router.navigate('/') }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll tabs edges={['top']} title="Saved mixes" contentStyle={{ gap: spacing.sm }}>
      {mixes.map((mix, index) => {
        const current = isCurrent(mix);
        return (
          <Animated.View
            key={mix.id}
            entering={FadeInDown.delay(index * 40).springify().damping(18)}
            exiting={FadeOut}
            layout={LinearTransition.springify().damping(18)}
          >
            <Card
              onPress={() => handlePlay(mix)}
              onLongPress={() => handleDelete(mix)}
              selected={current && playing}
            >
              <View style={[styles.row, { gap: spacing.md }]}>
                <View style={[styles.dots, { gap: spacing.xs }]}>
                  {mix.sounds.map((entry) => (
                    <View
                      key={entry.id}
                      style={{
                        width: 10,
                        height: 10 + 18 * entry.volume,
                        borderRadius: radii.pill,
                        backgroundColor: soundById[entry.id].tint,
                      }}
                    />
                  ))}
                </View>
                <View style={styles.body}>
                  <Text variant="heading" numberOfLines={1}>
                    {mix.name}
                  </Text>
                  <Text variant="caption" color="muted" numberOfLines={1}>
                    {mix.sounds.map((entry) => soundById[entry.id].name).join(' · ')}
                  </Text>
                  <Text variant="caption" color="muted">
                    Timer {formatTimer(mix.timerMinutes).toLowerCase()}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Play ${mix.name}`}
                  onPress={() => handlePlay(mix)}
                  hitSlop={8}
                  style={[
                    styles.play,
                    { backgroundColor: current && playing ? colors.primary : colors.surfaceRaised, borderRadius: radii.pill },
                  ]}
                >
                  <Icon
                    name={current && playing ? 'pause' : 'play'}
                    size={16}
                    color={current && playing ? colors.onPrimary : colors.text}
                    style={current && playing ? undefined : { marginLeft: 2 }}
                  />
                </Pressable>
              </View>
            </Card>
          </Animated.View>
        );
      })}
      <Text variant="caption" color="muted" align="center" style={{ marginTop: spacing.sm }}>
        Hold a mix to delete it.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grow: { flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  // Fixed width for three bars, so names line up whatever the mix size.
  dots: { flexDirection: 'row', alignItems: 'flex-end', height: 28, width: 38 },
  body: { flex: 1, gap: spacing.sm },
  play: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
