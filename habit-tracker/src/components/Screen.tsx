import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/theme';

import { LargeTitleScreen } from './LargeTitleScreen';

type ScreenProps = {
  children: ReactNode;
  /** Wrap the content in a ScrollView. */
  scroll?: boolean;
  /**
   * Which safe-area edges to pad. Tab screens pass `['top']` because the
   * tab bar already covers the bottom inset.
   */
  edges?: Edge[];
  /** Pinned under the content, above the bottom safe area (e.g. a Continue button). */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * Tab screens: a large title that collapses into a compact bar on scroll. The content then
   * always scrolls, with the gutter and bottom padding handled by `LargeTitleScreen`.
   */
  largeTitle?: string;
  subtitle?: string;
  /** Pinned to the right of the large title, e.g. an add button. */
  headerRight?: ReactNode;
};

export function Screen({
  children,
  scroll = false,
  edges = ['top', 'bottom'],
  footer,
  contentStyle,
  largeTitle,
  subtitle,
  headerRight,
}: ScreenProps) {
  const { colors, spacing } = useTheme();

  if (largeTitle) {
    return (
      <LargeTitleScreen title={largeTitle} subtitle={subtitle} right={headerRight}>
        {children}
      </LargeTitleScreen>
    );
  }

  const padding = { paddingHorizontal: spacing.gutter, paddingVertical: spacing.md };

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.root, padding, contentStyle]}>{children}</View>
      )}
      {footer ? <View style={[padding, { paddingTop: spacing.sm }]}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
