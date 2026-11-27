import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useCollapsingTitle } from '@/components/CollapsingTitle';
import { useTheme } from '@/theme/theme';

type ScreenProps = {
  children: ReactNode;
  /** Wrap the content in a ScrollView. */
  scroll?: boolean;
  /**
   * Which safe-area edges to pad. Tab screens pass `['top']` because the
   * tab bar already covers the bottom inset; screens under a native large
   * title pass `[]` and let the header insets do the work.
   */
  edges?: Edge[];
  /**
   * The bottom call to action, pinned 16 pt above the home indicator. Scrolling
   * content ends above it, so nothing slides under the button.
   */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** Overrides the theme background, e.g. the calmer tint during a focus session. */
  backgroundColor?: string;
  /** Large title at the top of the content; on a scrolling screen it collapses into a compact bar. */
  title?: string;
};

/** Every screen's frame: safe areas, the 20 pt gutter, the pinned CTA. */
export function Screen({
  children,
  scroll = false,
  edges = ['top', 'bottom'],
  footer,
  contentStyle,
  backgroundColor,
  title,
}: ScreenProps) {
  const { colors, spacing } = useTheme();
  const { onScroll, largeTitle, compactBar } = useCollapsingTitle(title ?? '');
  const gutter = { paddingHorizontal: spacing.gutter };

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: backgroundColor ?? colors.background }]}>
      {scroll ? (
        <View style={styles.root}>
          <Animated.ScrollView
            contentContainerStyle={[
              gutter,
              // The js tab bar sits below the scene rather than over it, so the
              // tabBar needs no extra inset here: 24 pt of breathing room is enough.
              { paddingTop: spacing.md, paddingBottom: spacing.lg },
              contentStyle,
            ]}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
          >
            {title ? largeTitle : null}
            {children}
          </Animated.ScrollView>
          {title ? compactBar : null}
        </View>
      ) : (
        <View style={[styles.root, gutter, { paddingTop: spacing.md }, contentStyle]}>
          {title ? largeTitle : null}
          {children}
        </View>
      )}
      {footer ? <View style={[gutter, { paddingTop: spacing.ms, paddingBottom: spacing.md }]}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
