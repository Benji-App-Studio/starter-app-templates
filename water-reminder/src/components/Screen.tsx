import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTheme, spacing } from '@/theme/theme';

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
  /** Set false when the child manages its own padding, e.g. `LargeTitleScroll`. */
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scroll = false,
  edges = ['top', 'bottom'],
  footer,
  padded = true,
  contentStyle,
}: ScreenProps) {
  const { colors, spacing } = useTheme();
  const padding = padded ? { paddingHorizontal: spacing.gutter, paddingVertical: spacing.md } : undefined;

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
      {footer ? (
        <View style={{ paddingHorizontal: spacing.gutter, paddingTop: spacing.ms, paddingBottom: spacing.md }}>{footer}</View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
