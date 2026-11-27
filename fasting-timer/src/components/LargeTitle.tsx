import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

const COLLAPSE_AT = 36;

/** Tracks the scroll offset a `LargeTitle` and `CompactHeader` pair reads from. */
export function useCollapsingTitle() {
  const offset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    offset.set(event.contentOffset.y);
  });
  return { offset, scrollHandler };
}

type TitleProps = {
  title: string;
  offset: SharedValue<number>;
};

/** The big title at the top of the scroll content. Shrinks and fades as the list scrolls. */
export function LargeTitle({ title, offset }: TitleProps) {
  const { spacing } = useTheme();
  const style = useAnimatedStyle(() => {
    const y = offset.get();
    return {
      opacity: interpolate(y, [0, COLLAPSE_AT], [1, 0], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(y, [-60, 0], [1.06, 1], Extrapolation.CLAMP) }],
    };
  });

  return (
    <Animated.View style={[styles.large, { marginBottom: spacing.md }, style]}>
      <Text variant="title">{title}</Text>
    </Animated.View>
  );
}

/** The compact bar pinned under the status bar. Appears once the large title has scrolled away. */
export function CompactHeader({ title, offset }: TitleProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(offset.get(), [COLLAPSE_AT - 12, COLLAPSE_AT + 12], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.compact,
        {
          paddingTop: insets.top,
          height: insets.top + 44,
          paddingHorizontal: spacing.gutter,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
        barStyle,
      ]}
    >
      <View style={styles.compactInner}>
        <Text variant="label">{title}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  large: { transformOrigin: 'left center' },
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  compactInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
