import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

const BAR_HEIGHT = 44;
const LARGE_TITLE_HEIGHT = 48;

type ScreenProps = {
  children: ReactNode;
  /** Large title that collapses into the compact bar on scroll. */
  title?: string;
  subtitle?: string;
  /** Shows a back (or close) button in the compact bar. */
  onBack?: () => void;
  backIcon?: 'back' | 'close';
  /** Right side of the compact bar, e.g. a Save button. */
  headerRight?: ReactNode;
  /** Wrap the content in a ScrollView. */
  scroll?: boolean;
  /** Tab screens pass `['top']` because the tab bar already covers the bottom inset. */
  edges?: Edge[];
  /**
   * Tab screens: the scene ends at the top of the tab bar, so the content only needs the
   * 24 pt of breathing room the layout rules ask for above the bar.
   */
  tabBar?: boolean;
  /** Pinned under the content, above the bottom safe area (e.g. a Continue button). */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  title,
  subtitle,
  onBack,
  backIcon = 'back',
  headerRight,
  scroll = false,
  tabBar = false,
  edges = tabBar ? ['top'] : ['top', 'bottom'],
  footer,
  contentStyle,
}: ScreenProps) {
  const { colors, spacing } = useTheme();
  const scrollY = useSharedValue(0);
  const hasBar = Boolean(title || onBack || headerRight);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const compactTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [LARGE_TITLE_HEIGHT - 16, LARGE_TITLE_HEIGHT + 12], [0, 1], 'clamp'),
  }));
  const barBorderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [LARGE_TITLE_HEIGHT, LARGE_TITLE_HEIGHT + 24], [0, 1], 'clamp'),
  }));
  const largeTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, LARGE_TITLE_HEIGHT], [1, 0], 'clamp'),
  }));

  const padding = {
    paddingHorizontal: spacing.gutter,
    paddingBottom: tabBar ? spacing.lg : footer ? spacing.lg : spacing.md,
  };
  const largeTitle = title ? (
    <Animated.View style={[{ paddingBottom: spacing.lg, gap: spacing.xs }, scroll && largeTitleStyle]}>
      <Text variant="title" accessibilityRole="header" numberOfLines={2}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="caption" color="muted" numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </Animated.View>
  ) : null;

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      {hasBar ? (
        <View style={[styles.bar, { height: BAR_HEIGHT, paddingHorizontal: spacing.sm, gap: spacing.sm }]}>
          <View style={styles.barSide}>
            {onBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={backIcon === 'close' ? 'Close' : 'Back'}
                hitSlop={8}
                onPress={onBack}
                style={({ pressed }) => [styles.barButton, { opacity: pressed ? 0.5 : 1 }]}
              >
                <Icon name={backIcon} size={backIcon === 'close' ? 20 : 22} />
              </Pressable>
            ) : null}
          </View>
          {title ? (
            <Animated.View style={[styles.barTitle, scroll ? compactTitleStyle : { opacity: 0 }]} pointerEvents="none">
              <Text variant="heading" numberOfLines={1}>
                {title}
              </Text>
            </Animated.View>
          ) : null}
          <View style={[styles.barSide, styles.barRight]}>{headerRight}</View>
          {scroll ? (
            <Animated.View
              pointerEvents="none"
              style={[styles.barBorder, { backgroundColor: colors.border }, barBorderStyle]}
            />
          ) : null}
        </View>
      ) : null}

      {scroll ? (
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {largeTitle}
          {children}
        </Animated.ScrollView>
      ) : (
        <View style={[styles.root, padding, contentStyle]}>
          {largeTitle}
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
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barSide: { width: 88, flexDirection: 'row', alignItems: 'center' },
  barRight: { justifyContent: 'flex-end' },
  barButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: { flex: 1, alignItems: 'center' },
  barBorder: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
  },
});
