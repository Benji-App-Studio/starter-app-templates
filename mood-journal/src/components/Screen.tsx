import type { ComponentRef, ReactNode, RefObject } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomCTA } from '@/components/BottomCTA';
import { Text } from '@/components/Text';
import { useTheme, type spacing } from '@/theme/theme';

/** What `scrollRef` points at: the screen's ScrollView. */
export type ScrollViewHandle = ComponentRef<typeof ScrollView>;

type ScreenProps = {
  children: ReactNode;
  /** Wrap the content in a ScrollView. Always on when `title` is set. */
  scroll?: boolean;
  /** A large title that collapses into a compact bar as the content scrolls. */
  title?: string;
  /** Small uppercase line above the large title. */
  eyebrow?: string;
  /** Pinned to the right of the large title. */
  accessory?: ReactNode;
  /** A tab screen: pads the bottom so the last item clears the tab bar by 24 pt. */
  tab?: boolean;
  /** Pinned under the content, 16 pt above the home indicator (e.g. Continue). */
  footer?: ReactNode;
  /** Overrides the theme background; 'transparent' lets a tinted parent show through. */
  backgroundColor?: string;
  /** Space between direct children; screens with a large title default to 24 pt. */
  gap?: keyof typeof spacing;
  contentStyle?: StyleProp<ViewStyle>;
  /** Lets a scrolling screen without a title scroll itself (back to the top, or to an input). */
  scrollRef?: RefObject<ScrollViewHandle | null>;
};

const COLLAPSE_DISTANCE = 56;
const COMPACT_BAR_HEIGHT = 44;

/**
 * Every screen starts here: top safe area, the 20 pt gutter, an optional
 * collapsing large title, tab-bar clearance and a pinned footer.
 */
export function Screen({
  children,
  scroll = false,
  title,
  eyebrow,
  accessory,
  tab = false,
  footer,
  backgroundColor,
  gap,
  contentStyle,
  scrollRef,
}: ScreenProps) {
  const theme = useTheme();
  const { colors, layout } = theme;
  const grid = theme.spacing;
  const gapKey = gap ?? (title ? 'lg' : undefined);
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const background = backgroundColor ?? colors.background;
  const bottomInset = tab
    ? layout.tabBarHeight + insets.bottom + grid.lg
    : footer
      ? grid.lg
      : insets.bottom + grid.lg;

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const largeTitle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_DISTANCE * 0.7], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [-80, 0], [12, 0], Extrapolation.CLAMP) }],
  }));
  const compactBar = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COLLAPSE_DISTANCE * 0.6, COLLAPSE_DISTANCE], [0, 1], Extrapolation.CLAMP),
  }));

  const content = [
    styles.content,
    { paddingHorizontal: grid.gutter, paddingTop: grid.md, paddingBottom: bottomInset, gap: gapKey ? grid[gapKey] : undefined },
    contentStyle,
  ];

  return (
    <View style={[styles.root, { backgroundColor: background, paddingTop: insets.top }]}>
      {title ? (
        <>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.compact,
              { top: insets.top, backgroundColor: background, borderBottomColor: colors.border },
              compactBar,
            ]}
          >
            <Text variant="label" numberOfLines={1}>
              {title}
            </Text>
          </Animated.View>
          <Animated.ScrollView
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={content}
          >
            <Animated.View style={[styles.titleRow, { gap: grid.md }, largeTitle]}>
              <View style={styles.titleBody}>
                {eyebrow ? (
                  <Text variant="eyebrow" color="muted" numberOfLines={1}>
                    {eyebrow.toUpperCase()}
                  </Text>
                ) : null}
                <Text variant="display" numberOfLines={1}>
                  {title}
                </Text>
              </View>
              {accessory}
            </Animated.View>
            {children}
          </Animated.ScrollView>
        </>
      ) : scroll ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, content]}>{children}</View>
      )}
      {footer ? <BottomCTA backgroundColor={background}>{footer}</BottomCTA> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1 },
  compact: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    height: COMPACT_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end' },
  titleBody: { flex: 1, minWidth: 0 },
});
