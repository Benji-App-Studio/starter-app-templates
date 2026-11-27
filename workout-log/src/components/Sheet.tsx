import { BlurView } from 'expo-blur';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/theme';

const SPRING = { damping: 24, stiffness: 260, mass: 0.9 };
const OFFSCREEN = 600;

type SheetProps = {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
  /** Dim and block the screen behind. Off for the rest timer, which must not block the set table. */
  dim?: boolean;
};

/**
 * A bottom sheet built from reanimated + gesture-handler: springs up, drags down to dismiss,
 * fades instead when Reduce Motion is on.
 */
export function Sheet({ visible, onDismiss, children, dim = true }: SheetProps) {
  const { colors, radii, scheme, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const [height, setHeight] = useState(0);
  const translateY = useSharedValue(OFFSCREEN);
  const opacity = useSharedValue(0);
  const dragStart = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!mounted || height === 0) {
      return;
    }
    if (visible) {
      opacity.value = withTiming(1, { duration: 180 });
      translateY.value = reducedMotion ? 0 : withSpring(0, SPRING);
      return;
    }
    const unmount = () => setMounted(false);
    opacity.value = withTiming(0, { duration: 180 });
    translateY.value = reducedMotion
      ? withTiming(0, { duration: 180 }, () => runOnJS(unmount)())
      : withSpring(height + insets.bottom, { ...SPRING, overshootClamping: true }, () => runOnJS(unmount)());
  }, [height, insets.bottom, mounted, opacity, reducedMotion, translateY, visible]);

  const pan = usePanGesture({
    runOnJS: true,
    activeOffsetY: [-8, 8],
    onActivate: () => {
      dragStart.value = translateY.value;
    },
    onUpdate: (event) => {
      translateY.value = Math.max(0, dragStart.value + event.translationY);
    },
    onDeactivate: (event) => {
      if (event.translationY > 72 || event.velocityY > 600) {
        onDismiss();
      } else {
        translateY.value = withSpring(0, SPRING);
      }
    },
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: reducedMotion ? 0 : translateY.value }],
    opacity: reducedMotion ? opacity.value : height === 0 ? 0 : 1,
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!mounted) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {dim ? (
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onDismiss}
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
          />
        </Animated.View>
      ) : null}
      <GestureDetector gesture={pan}>
        <Animated.View
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          style={[
            styles.sheet,
            {
              // Undimmed sheets sit over live content, so they blur it instead of covering it.
              backgroundColor: dim ? colors.surface : `${colors.surface}D9`,
              borderColor: colors.border,
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
              paddingHorizontal: spacing.gutter,
              paddingBottom: insets.bottom + spacing.md,
            },
            sheetStyle,
          ]}
        >
          {dim ? null : (
            <BlurView
              intensity={40}
              tint={scheme === 'dark' ? 'dark' : 'light'}
              style={[StyleSheet.absoluteFill, { borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, overflow: 'hidden' }]}
            />
          )}
          <View
            style={[
              styles.grabber,
              { backgroundColor: colors.border, borderRadius: radii.pill, marginTop: spacing.sm, marginBottom: spacing.md },
            ]}
          />
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
  },
});
