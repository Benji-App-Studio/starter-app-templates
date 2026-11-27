import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

const COMPACT_BAR_HEIGHT = 44;

/**
 * A large title that collapses into a compact bar on scroll, drawn by the app.
 * (The native large title went blank after the first scroll on iOS 26 with a tinted
 * header, so the tab stacks hide the native header and use this instead.)
 */
export function useCollapsingTitle(title: string) {
  const { colors, spacing } = useTheme();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [spacing.lg, spacing.xxl], [0, 1], Extrapolation.CLAMP),
  }));

  const largeTitle = (
    <View style={{ paddingBottom: spacing.lg }}>
      <Text variant="display" accessibilityRole="header">
        {title}
      </Text>
    </View>
  );

  const compactBar = (
    <Animated.View
      pointerEvents="none"
      style={[styles.bar, { backgroundColor: colors.background, borderBottomColor: colors.border }, barStyle]}
    >
      <Text variant="label" align="center">
        {title}
      </Text>
    </Animated.View>
  );

  return { onScroll, largeTitle, compactBar };
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: COMPACT_BAR_HEIGHT,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
