import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
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

import { Text } from '@/components/Text';
import { useTheme, spacing } from '@/theme/theme';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

const OFFSCREEN = 720;
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 900;
const SPRING = { damping: 22, stiffness: 240, mass: 0.9 };

/**
 * A bottom sheet for add and edit flows. Slides up with a spring, dims the
 * screen behind it, and can be dragged or tapped away. Built with reanimated
 * and gesture-handler so it feels like the system sheets without a library.
 */
export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const { colors, radii, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(OFFSCREEN);
  const backdrop = useSharedValue(0);

  function finishClose() {
    setMounted(false);
    onClose();
  }

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdrop.value = withTiming(1, { duration: 220 });
      translateY.value = reducedMotion ? withTiming(0, { duration: 200 }) : withSpring(0, SPRING);
    } else if (mounted) {
      backdrop.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(OFFSCREEN, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
    }
  }, [visible, mounted, reducedMotion, backdrop, translateY]);

  const pan = usePanGesture({
    activeOffsetY: 8,
    onUpdate: (event) => {
      'worklet';
      translateY.value = Math.max(0, event.translationY);
    },
    onDeactivate: (event) => {
      'worklet';
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        backdrop.value = withTiming(0, { duration: 180 });
        translateY.value = withTiming(OFFSCREEN, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(finishClose)();
          }
        });
      } else {
        translateY.value = withSpring(0, SPRING);
      }
    },
  });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value * 0.45 }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal transparent visible statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable accessibilityLabel="Close" style={styles.root} onPress={onClose} />
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radii.lg + 6,
                borderTopRightRadius: radii.lg + 6,
                paddingHorizontal: spacing.gutter,
                paddingBottom: Math.max(insets.bottom, spacing.md),
              },
              sheetStyle,
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border, borderRadius: radii.pill }]} />
            <Text variant="heading" style={{ marginBottom: spacing.md }}>
              {title}
            </Text>
            {children}
          </Animated.View>
        </GestureDetector>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000' },
  sheet: { paddingTop: spacing.ms },
  handle: { width: 40, height: 5, alignSelf: 'center', marginBottom: spacing.md },
});
