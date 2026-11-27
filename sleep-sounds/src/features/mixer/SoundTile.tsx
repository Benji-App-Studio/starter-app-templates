import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Icon, Text } from '@/components';
import { useTheme } from '@/theme/theme';

import { MIN_VOLUME } from './engine';
import type { Sound } from './sounds';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING = 60;
const STROKE = 4;
const RADIUS = (RING - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** The arc covers three quarters of the ring, open at the bottom. */
const SWEEP = 0.75;
/** Points of vertical drag for the full volume range. */
const DRAG_RANGE = 140;
const HOLD_MS = 180;

type SoundTileProps = {
  sound: Sound;
  /** The level when the sound is in the mix; undefined when it is not. */
  volume: number | undefined;
  onToggle: () => void;
  onVolume: (volume: number) => void;
};

/**
 * One sound in the grid. Tap adds or removes it; press, hold and drag up or down to set
 * its level on the arc around the icon, with a tick every five percent.
 */
export function SoundTile({ sound, volume, onToggle, onVolume }: SoundTileProps) {
  const { colors, radii, spacing } = useTheme();
  const active = volume !== undefined;
  const level = useSharedValue(volume ?? 0);
  const scale = useSharedValue(1);
  const startLevel = useSharedValue(0);
  const lastTick = useSharedValue(0);
  const [adjusting, setAdjusting] = useState<number | null>(null);

  useEffect(() => {
    level.set(withSpring(volume ?? 0, { damping: 16, stiffness: 160 }));
  }, [volume, level]);

  function tick() {
    void Haptics.selectionAsync();
  }

  function toggle() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  }

  function commit(value: number) {
    onVolume(value);
  }

  const tap = Gesture.Tap()
    .maxDuration(HOLD_MS)
    .onEnd(() => {
      runOnJS(toggle)();
    });

  const drag = Gesture.Pan()
    .enabled(active)
    .activateAfterLongPress(HOLD_MS)
    .onStart(() => {
      startLevel.set(level.get());
      lastTick.set(Math.round(level.get() * 20));
      scale.set(withSpring(1.06, { damping: 14, stiffness: 200 }));
      runOnJS(setAdjusting)(Math.round(level.get() * 100));
      runOnJS(tick)();
    })
    .onUpdate((event) => {
      const next = Math.min(1, Math.max(MIN_VOLUME, startLevel.get() - event.translationY / DRAG_RANGE));
      level.set(next);
      const step = Math.round(next * 20);
      if (step !== lastTick.get()) {
        lastTick.set(step);
        runOnJS(tick)();
        runOnJS(setAdjusting)(step * 5);
        runOnJS(commit)(step / 20);
      }
    })
    .onFinalize(() => {
      scale.set(withSpring(1, { damping: 14, stiffness: 200 }));
      runOnJS(setAdjusting)(null);
    });

  const gesture = Gesture.Race(drag, tap);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * SWEEP * (1 - level.get()),
  }));
  const tileStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessibilityRole="button"
        accessibilityLabel={sound.name}
        accessibilityState={{ selected: active }}
        accessibilityHint={active ? 'Hold and drag to change the level' : undefined}
        style={[
          styles.tile,
          tileStyle,
          {
            backgroundColor: active ? colors.surfaceRaised : colors.surface,
            borderRadius: radii.lg,
            borderCurve: 'continuous',
            paddingVertical: spacing.item,
            paddingHorizontal: spacing.sm,
            gap: spacing.xs,
          },
        ]}
      >
        <View style={styles.ring}>
          <Svg width={RING} height={RING} style={styles.arc}>
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={RADIUS}
              stroke={active ? colors.border : 'transparent'}
              strokeWidth={STROKE}
              strokeDasharray={`${CIRCUMFERENCE * SWEEP} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              fill="none"
            />
            <AnimatedCircle
              animatedProps={arcProps}
              cx={RING / 2}
              cy={RING / 2}
              r={RADIUS}
              stroke={colors.primary}
              strokeWidth={STROKE}
              strokeDasharray={`${CIRCUMFERENCE * SWEEP} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          <Icon name={sound.icon} size={24} color={active ? colors.text : colors.textMuted} />
        </View>
        <Text
          variant="caption"
          color={active ? 'text' : 'muted'}
          align="center"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          tabular
        >
          {adjusting === null ? sound.name : `${adjusting}%`}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    minHeight: 104,
  },
  ring: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arc: {
    position: 'absolute',
    // Rotate so the open quarter of the arc sits at the bottom.
    transform: [{ rotate: '135deg' }],
  },
});
