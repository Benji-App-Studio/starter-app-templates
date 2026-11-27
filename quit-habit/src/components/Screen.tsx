import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomCTA } from '@/components/BottomCTA';
import { Row } from '@/components/Row';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type ScreenProps = {
  children: ReactNode;
  /** Wrap the content in a ScrollView. Implied by `title`. */
  scroll?: boolean;
  /** A large title that collapses into a compact bar on scroll, the way native lists do. */
  title?: string;
  /** Shown to the right of the large title, e.g. a count. */
  titleAccessory?: ReactNode;
  /** A tab screen: the tab bar owns the bottom inset. */
  tab?: boolean;
  /** Pinned under the content, 16 pt above the home indicator (e.g. a Continue button). */
  footer?: ReactNode;
  /** Pad the top safe area. Off for page-sheet modals, which already start below the status bar. */
  topInset?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

const LARGE_TITLE_HEIGHT = 52;
const BAR_HEIGHT = 44;

/**
 * Every screen's frame: safe areas, the 20 pt gutter, an optional collapsing title,
 * an optional pinned footer. The JS tab bar is laid out below the scene rather than
 * over it, so tab screens only need `spacing.lg` under their last item.
 */
export function Screen({
  children,
  scroll = false,
  title,
  titleAccessory,
  tab = false,
  footer,
  topInset = true,
  contentStyle,
}: ScreenProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const top = topInset ? insets.top : 0;
  const bottomPadding = footer ? spacing.md : tab ? spacing.lg : insets.bottom + spacing.lg;
  const gutters = { paddingHorizontal: spacing.gutter };
  const footerNode = footer ? <BottomCTA insideTabs={tab}>{footer}</BottomCTA> : null;

  if (title) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <LargeTitleScroll
          title={title}
          accessory={titleAccessory}
          top={top}
          contentStyle={[gutters, { paddingBottom: bottomPadding }, contentStyle]}
        >
          {children}
        </LargeTitleScroll>
        {footerNode}
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: top }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[gutters, styles.grow, { paddingTop: spacing.sm, paddingBottom: bottomPadding }, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, gutters, { paddingTop: spacing.sm, paddingBottom: bottomPadding }, contentStyle]}>
          {children}
        </View>
      )}
      {footerNode}
    </View>
  );
}

function LargeTitleScroll({
  title,
  accessory,
  top,
  contentStyle,
  children,
}: {
  title: string;
  accessory?: ReactNode;
  top: number;
  contentStyle: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const { colors, spacing } = useTheme();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const barTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [LARGE_TITLE_HEIGHT - 16, LARGE_TITLE_HEIGHT + 8], [0, 1], 'clamp'),
  }));
  const barBorderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [LARGE_TITLE_HEIGHT, LARGE_TITLE_HEIGHT + 24], [0, 1], 'clamp'),
  }));
  const largeTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, LARGE_TITLE_HEIGHT - 8], [1, 0], 'clamp'),
  }));

  return (
    <>
      <View style={[styles.bar, { paddingTop: top, height: top + BAR_HEIGHT, backgroundColor: colors.background }]}>
        <Animated.View style={barTitleStyle}>
          <Text variant="label">{title}</Text>
        </Animated.View>
        <Animated.View style={[styles.barBorder, barBorderStyle, { backgroundColor: colors.border }]} />
      </View>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.grow, { paddingTop: top + BAR_HEIGHT }, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[largeTitleStyle, { height: LARGE_TITLE_HEIGHT, marginBottom: spacing.md }]}>
          <Row justify="space-between" align="flex-end" gap="md" style={styles.grow}>
            <Text variant="title" numberOfLines={1} style={styles.shrink}>
              {title}
            </Text>
            {accessory}
          </Row>
        </Animated.View>
        {children}
      </Animated.ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grow: { flexGrow: 1 },
  shrink: { flexShrink: 1, minWidth: 0 },
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
});
