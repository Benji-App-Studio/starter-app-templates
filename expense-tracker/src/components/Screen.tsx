import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type ScreenProps = {
  children: ReactNode;
  /** Wrap the content in a ScrollView. Implied by `title`. */
  scroll?: boolean;
  /**
   * Which safe-area edges to pad. Tab screens pass `['top']` because the
   * tab bar already covers the bottom inset.
   */
  edges?: Edge[];
  /** Pinned under the content, above the bottom safe area (e.g. a Continue button). */
  footer?: ReactNode;
  /**
   * Large serif title at the top of the content. It scrolls away and a compact
   * bar with the same title fades in, like a native large-title screen.
   */
  title?: string;
  subtitle?: string;
  /**
   * Content of a form sheet (`presentation: 'formSheet'`, `sheetAllowedDetents: 'fitToContents'`):
   * sized by its children, on the surface color, padded above the home indicator.
   */
  sheet?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

const COMPACT_BAR_HEIGHT = 44;

export function Screen({
  children,
  scroll = false,
  edges = ['top', 'bottom'],
  footer,
  title,
  subtitle,
  sheet = false,
  contentStyle,
}: ScreenProps) {
  const { colors, spacing } = useTheme();
  const padding = { paddingHorizontal: spacing.gutter, paddingVertical: spacing.md };

  if (sheet) {
    return <SheetScreen contentStyle={contentStyle}>{children}</SheetScreen>;
  }

  if (title) {
    return (
      <TitledScreen
        title={title}
        subtitle={subtitle}
        edges={edges}
        footer={footer}
        contentStyle={contentStyle}
      >
        {children}
      </TitledScreen>
    );
  }

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
        <View style={{ paddingHorizontal: spacing.gutter, paddingTop: spacing.sm, paddingBottom: spacing.md }}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

type TitledScreenProps = Required<Pick<ScreenProps, 'title' | 'children' | 'edges'>> &
  Pick<ScreenProps, 'subtitle' | 'footer' | 'contentStyle'>;

function TitledScreen({ title, subtitle, edges, footer, contentStyle, children }: TitledScreenProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const topInset = edges.includes('top') ? insets.top : 0;
  const bottomInset = edges.includes('bottom') ? insets.bottom : 0;

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [28, 60], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {
            paddingHorizontal: spacing.gutter,
            paddingTop: topInset + spacing.sm,
            // The tab bar sits below this scene, so the last row only needs breathing room above it.
            paddingBottom: footer ? spacing.md : spacing.lg + bottomInset,
          },
          contentStyle,
        ]}
      >
        <View style={{ marginBottom: spacing.lg, gap: spacing.xs }}>
          <Text variant="title" numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text color="muted" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {children}
      </Animated.ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.compactBar,
          compactStyle,
          {
            paddingTop: topInset,
            height: topInset + COMPACT_BAR_HEIGHT,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text variant="label" numberOfLines={1}>
          {title}
        </Text>
      </Animated.View>

      {footer ? (
        <View style={{ paddingHorizontal: spacing.gutter, paddingTop: spacing.sm, paddingBottom: spacing.md + bottomInset }}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}

function SheetScreen({ children, contentStyle }: Pick<ScreenProps, 'children' | 'contentStyle'>) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.gutter,
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + spacing.md,
        },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  compactBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
