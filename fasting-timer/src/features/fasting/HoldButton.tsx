import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, useLongPressGesture } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components';
import { useTheme } from '@/theme/theme';

const HOLD_MS = 650;

type HoldButtonProps = {
  title: string;
  /** Runs once the finger has stayed down for the full hold. */
  onCommit: () => void;
};

/**
 * The signature action: press and hold to start a fast. A fill sweeps across
 * the pill while the finger is down and the commit lands with a haptic.
 * A short tap does nothing, so a fast is never started by accident.
 */
export function HoldButton({ title, onCommit }: HoldButtonProps) {
  const { colors, radii } = useTheme();
  const reducedMotion = useReducedMotion();
  const hold = useSharedValue(0);
  const committed = useRef(false);

  const gesture = useLongPressGesture({
    minDuration: HOLD_MS,
    maxDistance: 24,
    runOnJS: true,
    onBegin: () => {
      committed.current = false;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      hold.set(withTiming(1, { duration: HOLD_MS, easing: Easing.out(Easing.quad) }));
    },
    onActivate: () => {
      committed.current = true;
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onCommit();
    },
    onFinalize: () => {
      hold.set(committed.current ? 0 : withSpring(0, { damping: 18, stiffness: 180 }));
    },
  });

  const fillStyle = useAnimatedStyle(() =>
    reducedMotion
      ? { opacity: hold.get(), width: '100%' }
      : { width: `${hold.get() * 100}%`, opacity: 1 },
  );
  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - hold.get() * 0.03 }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint="Press and hold"
        style={[
          styles.pill,
          { backgroundColor: colors.primarySoft, borderRadius: radii.pill, borderColor: colors.primary },
        ]}
      >
        <Animated.View style={[styles.fill, { backgroundColor: colors.primary }, fillStyle]} />
        <Animated.View style={[styles.label, labelStyle]}>
          <Text variant="label">{title}</Text>
        </Animated.View>
        <View pointerEvents="none" style={styles.hint}>
          <Text variant="caption" color="muted">
            hold
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 60,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  label: { alignItems: 'center' },
  hint: { position: 'absolute', right: 20 },
});
