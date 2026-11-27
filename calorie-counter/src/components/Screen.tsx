import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

const COMPACT_HEADER_HEIGHT = 44;

type ScreenProps = {
  children: ReactNode;
  /** Wrap the content in a ScrollView. */
  scroll?: boolean;
  /**
   * Large title at the top of the content. On a scrolling screen it collapses
   * into a compact bar as the content moves under it.
   */
  title?: string;
  /** One line under the large title, e.g. today's date. */
  subtitle?: string;
  /**
   * Which safe-area edges to pad. Tab screens pass `['top']` because the
   * tab bar already covers the bottom inset.
   */
  edges?: Edge[];
  /** Pinned under the content, above the bottom safe area (e.g. a Continue button). */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

function LargeTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { spacing } = useTheme();
  return (
    <View style={{ marginBottom: spacing.lg, gap: spacing.xs }}>
      <Text variant="title">{title}</Text>
      {subtitle ? (
        <Text variant="caption" color="muted">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function Screen({
  children,
  scroll = false,
  title,
  subtitle,
  edges = ['top', 'bottom'],
  footer,
  contentStyle,
}: ScreenProps) {
  const { colors, spacing } = useTheme();
  const padding = { paddingHorizontal: spacing.gutter, paddingTop: spacing.md, paddingBottom: spacing.md };
  // Scrolling content ends 24 pt above whatever is pinned below it (footer or tab bar).
  const scrollPadding = { ...padding, paddingBottom: spacing.lg };
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const compactBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [24, 56], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      {scroll ? (
        <View style={styles.root}>
          <Animated.ScrollView
            contentContainerStyle={[scrollPadding, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {title ? <LargeTitle title={title} subtitle={subtitle} /> : null}
            {children}
          </Animated.ScrollView>
          {title ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.compactBar,
                { backgroundColor: colors.background, borderBottomColor: colors.border },
                compactBarStyle,
              ]}
            >
              <Text variant="label" align="center">
                {title}
              </Text>
            </Animated.View>
          ) : null}
        </View>
      ) : (
        <View style={[styles.root, padding, contentStyle]}>
          {title ? <LargeTitle title={title} subtitle={subtitle} /> : null}
          {children}
        </View>
      )}
      {footer ? (
        <View style={{ paddingHorizontal: spacing.gutter, paddingTop: spacing.sm, paddingBottom: spacing.md }}>{footer}</View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  compactBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: COMPACT_HEADER_HEIGHT,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
