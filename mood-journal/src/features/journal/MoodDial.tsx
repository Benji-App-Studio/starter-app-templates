import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import type { MoodScore } from '@/db/checkIns';
import { useTheme } from '@/theme/theme';

import { MoodFace } from './MoodFace';
import { MOOD_SCORES, moodFor, progressForScore, scoreForProgress } from './moods';

type MoodDialProps = {
  /** Shared with the screen so the background can tint along. */
  progress: SharedValue<number>;
  /** Fires while dragging whenever the finger crosses into a new mood. */
  onScoreChange: (score: MoodScore) => void;
  /** Fires when the finger lifts and the face has settled. */
  onCommit?: (score: MoodScore) => void;
  enabled?: boolean;
  width: number;
};

const START_ANGLE = 198;
const END_ANGLE = 342;
const FACE_SIZE = 96;
const TRACK_WIDTH = 26;
/** The white ring around the face, so it reads as something to pick up. */
const HALO = 6;

function toRadians(degrees: number) {
  'worklet';
  return (degrees * Math.PI) / 180;
}

/**
 * The signature interaction: a curved color field you drag the face along.
 * The face morphs, the screen tints, and a haptic ticks at each mood.
 */
export function MoodDial({ progress, onScoreChange, onCommit, enabled = true, width }: MoodDialProps) {
  const { colors, scheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const [band, setBand] = useState<MoodScore>(scoreForProgress(progress.value));
  const lift = useSharedValue(1);

  // The face (and its halo) must stay inside the dial's width at both ends of the arc.
  const radius = Math.min(width * 0.42, (width / 2 - FACE_SIZE / 2 - HALO) / Math.cos(toRadians(180 - START_ANGLE)));
  const centerX = width / 2;
  const centerY = radius + FACE_SIZE / 2 + 8;
  const height = centerY + radius * Math.sin(toRadians(START_ANGLE)) + FACE_SIZE / 2 + 24;
  const leftX = centerX + radius * Math.cos(toRadians(START_ANGLE));
  const rightX = centerX + radius * Math.cos(toRadians(END_ANGLE));

  function pointAt(value: number) {
    'worklet';
    const angle = toRadians(START_ANGLE + (END_ANGLE - START_ANGLE) * value);
    return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
  }

  const start = pointAt(0);
  const end = pointAt(1);
  const track = `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;

  function tick(score: MoodScore) {
    setBand(score);
    onScoreChange(score);
    void Haptics.selectionAsync();
  }

  function commit(score: MoodScore) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onCommit?.(score);
  }

  function setFromX(x: number, bandBefore: MoodScore) {
    'worklet';
    const next = Math.min(1, Math.max(0, (x - leftX) / (rightX - leftX)));
    progress.value = next;
    const score = scoreForProgress(next);
    if (score !== bandBefore) {
      runOnJS(tick)(score);
    }
    return score;
  }

  const pan = Gesture.Pan()
    .enabled(enabled)
    .minDistance(0)
    .onBegin((event) => {
      lift.value = reducedMotion ? 1 : withSpring(1.08, { damping: 14, stiffness: 260 });
      setFromX(event.x, band);
    })
    .onUpdate((event) => {
      setFromX(event.x, scoreForProgress(progress.value));
    })
    .onFinalize(() => {
      const score = scoreForProgress(progress.value);
      const target = progressForScore(score);
      progress.value = reducedMotion ? target : withSpring(target, { damping: 16, stiffness: 190 });
      lift.value = reducedMotion ? 1 : withSpring(1, { damping: 10, stiffness: 220 });
      runOnJS(commit)(score);
    });

  const faceStyle = useAnimatedStyle(() => {
    const point = pointAt(progress.value);
    return {
      transform: [
        { translateX: point.x - FACE_SIZE / 2 },
        { translateY: point.y - FACE_SIZE / 2 },
        { scale: enabled ? lift.value : 0.96 },
      ],
    };
  });

  const stops = colors.mood.map((color, index) => (
    <Stop key={color} offset={index / 4} stopColor={color} stopOpacity={scheme === 'dark' ? 0.85 : 1} />
  ));

  return (
    <GestureDetector gesture={pan}>
      <View
        style={{ width, height }}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Mood"
        accessibilityValue={{ text: moodFor(band).label }}
        accessibilityActions={enabled ? [{ name: 'increment' }, { name: 'decrement' }] : []}
        onAccessibilityAction={(event) => {
          const delta = event.nativeEvent.actionName === 'increment' ? 1 : -1;
          const next = MOOD_SCORES.find((score) => score === band + delta);
          if (next) {
            progress.value = progressForScore(next);
            tick(next);
            onCommit?.(next);
          }
        }}
      >
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="field" x1="0" y1="0" x2="1" y2="0">
              {stops}
            </LinearGradient>
          </Defs>
          <Path
            d={track}
            stroke={colors.surface}
            strokeWidth={TRACK_WIDTH + 10}
            strokeLinecap="round"
            fill="none"
            opacity={scheme === 'dark' ? 0.35 : 0.9}
          />
          <Path d={track} stroke="url(#field)" strokeWidth={TRACK_WIDTH} strokeLinecap="round" fill="none" />
          {MOOD_SCORES.map((score) => {
            const point = pointAt(progressForScore(score));
            return <Circle key={score} cx={point.x} cy={point.y} r={3.5} fill={colors.background} opacity={0.9} />;
          })}
        </Svg>
        <Animated.View style={[styles.face, faceStyle]}>
          <View style={[styles.halo, { backgroundColor: colors.surface }]} />
          <MoodFace progress={progress} size={FACE_SIZE} />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  face: { position: 'absolute', width: FACE_SIZE, height: FACE_SIZE },
  halo: {
    position: 'absolute',
    left: -HALO,
    top: -HALO,
    width: FACE_SIZE + HALO * 2,
    height: FACE_SIZE + HALO * 2,
    borderRadius: 999,
    opacity: 0.9,
  },
});
