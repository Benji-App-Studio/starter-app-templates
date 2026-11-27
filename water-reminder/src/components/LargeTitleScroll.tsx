import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { spacing, useTheme } from '@/theme/theme';

type LargeTitleScrollProps = {
  title: string;
  /** Shown under the large title, e.g. today's date. */
  subtitle?: string;
  /** Sits to the right of the large title, e.g. a small status pill. */
  accessory?: ReactNode;
  children: ReactNode;
};

const COLLAPSE_DISTANCE = 56;
const BAR_HEIGHT = 44;

/**
 * A scrolling screen with an iOS-style large title that fades out as the content
 * scrolls, while a compact title bar fades in and stays pinned at the top.
 */
export function LargeTitleScroll({ title, subtitle, accessory, children }: LargeTitleScrollProps) {
  const { colors } = useTheme();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const largeTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_DISTANCE * 0.7], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, COLLAPSE_DISTANCE], [0, -8], Extrapolation.CLAMP) },
    ],
  }));

  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COLLAPSE_DISTANCE * 0.6, COLLAPSE_DISTANCE], [0, 1], Extrapolation.CLAMP),
  }));

  const barBorderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COLLAPSE_DISTANCE, COLLAPSE_DISTANCE + 20], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.root}>
      <Animated.View
        pointerEvents="none"
        style={[styles.bar, { height: BAR_HEIGHT, backgroundColor: colors.background }, barStyle]}
      >
        <Text variant="label">{title}</Text>
        <Animated.View style={[styles.barBorder, { backgroundColor: colors.border }, barBorderStyle]} />
      </Animated.View>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.tabClearance }}
      >
        <Animated.View style={[styles.titleRow, { marginTop: spacing.sm, marginBottom: spacing.md }, largeTitleStyle]}>
          <View style={styles.titleText}>
            <Text variant="display">{title}</Text>
            {subtitle ? (
              <Text variant="caption" color="muted">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {accessory}
        </Animated.View>
        {children}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barBorder: { position: 'absolute', left: 0, right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  titleText: { flex: 1, gap: spacing.sm },
});
