import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type LargeTitleScreenProps = {
  title: string;
  subtitle?: string;
  /** Pinned to the right of the title, e.g. an add button. */
  right?: ReactNode;
  children: ReactNode;
};

const COMPACT_BAR_HEIGHT = 44;
const COLLAPSE_DISTANCE = 56;

/**
 * A tab screen with a large title that scrolls away while a compact bar fades in,
 * the way native iOS lists behave.
 */
export function LargeTitleScreen({ title, subtitle, right, children }: LargeTitleScreenProps) {
  const { colors, spacing } = useTheme();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COLLAPSE_DISTANCE * 0.6, COLLAPSE_DISTANCE], [0, 1], Extrapolation.CLAMP),
  }));

  const largeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_DISTANCE * 0.8], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <SafeAreaView edges={['top']} style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.compactBar,
          { height: COMPACT_BAR_HEIGHT, paddingHorizontal: spacing.gutter, marginBottom: spacing.sm },
        ]}
      >
        <Animated.View style={[styles.compactTitle, compactStyle]}>
          <Text variant="label" align="center">
            {title}
          </Text>
        </Animated.View>
        <View style={styles.compactRight}>{right}</View>
      </View>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        // The JS tab bar sits below the scene, so the content only needs its own breathing room.
        contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[largeStyle, { marginBottom: spacing.xs }]}>
          <Text variant="display">{title}</Text>
          {subtitle ? (
            <Text color="muted" style={{ marginTop: spacing.sm }}>
              {subtitle}
            </Text>
          ) : null}
        </Animated.View>
        {children}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  compactBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  compactTitle: { position: 'absolute', left: 0, right: 0 },
  compactRight: { minWidth: 44, alignItems: 'flex-end' },
});
