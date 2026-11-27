import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { fonts, spacing, useTheme } from '@/theme/theme';

type ScreenProps = {
  children: ReactNode;
  /** Wrap the content in a ScrollView. */
  scroll?: boolean;
  /**
   * Which safe-area edges to pad. Tab screens pass `['top']` because the
   * tab bar already covers the bottom inset.
   */
  edges?: Edge[];
  /**
   * A large title at the top of the content. On a scrolling screen it hands over to a
   * compact bar with the same title once it scrolls away, like a native large title.
   */
  title?: string;
  /** Pinned under the content, above the bottom safe area (e.g. a Continue button). */
  footer?: ReactNode;
  /** The screen sits in the tabs, under the translucent tab bar: leave room for it at the end. */
  tabs?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Height of the translucent tab bar above the bottom safe area. */
export const TAB_BAR_HEIGHT = 56;
/** Height of the compact title bar that appears once the large title scrolls away. */
const BAR_HEIGHT = 44;
/** Scroll distance over which the large title hands over to the compact bar. */
const HANDOFF = 40;

export function Screen({
  children,
  scroll = false,
  edges = ['top', 'bottom'],
  title,
  footer,
  tabs = false,
  contentStyle,
}: ScreenProps) {
  const { colors, scheme, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [HANDOFF / 2, HANDOFF], [0, 1], 'clamp'),
  }));

  const padding = {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    // The last item clears the translucent tab bar with a section's worth of air.
    paddingBottom: tabs ? TAB_BAR_HEIGHT + insets.bottom + spacing.lg : spacing.md,
  };
  const largeTitle = title ? (
    <Text accessibilityRole="header" style={[styles.largeTitle, { color: colors.text, marginBottom: spacing.lg }]}>
      {title}
    </Text>
  ) : null;

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      {scroll ? (
        <Animated.ScrollView
          contentContainerStyle={[padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={title ? onScroll : undefined}
          scrollEventThrottle={16}
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
      {title && scroll ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bar,
            barStyle,
            { top: edges.includes('top') ? insets.top : 0, borderBottomColor: colors.border },
          ]}
        >
          <BlurView
            intensity={scheme === 'dark' ? 60 : 80}
            tint={scheme === 'dark' ? 'systemUltraThinMaterialDark' : 'systemUltraThinMaterialLight'}
            style={StyleSheet.absoluteFill}
          />
          <Text variant="label">{title}</Text>
        </Animated.View>
      ) : null}
      {footer ? (
        <View style={{ paddingHorizontal: spacing.gutter, paddingTop: spacing.sm, paddingBottom: spacing.md }}>
          {scroll ? (
            // Content scrolls out under the footer instead of being cut by a hard edge.
            <LinearGradient
              colors={[`${colors.background}00`, colors.background]}
              pointerEvents="none"
              style={styles.scrim}
            />
          ) : null}
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  largeTitle: { fontFamily: fonts.light, fontSize: 34, lineHeight: 41, letterSpacing: -0.5 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scrim: { position: 'absolute', left: 0, right: 0, top: -spacing.lg, height: spacing.lg },
});
