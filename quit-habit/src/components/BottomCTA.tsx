import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/theme';

type BottomCTAProps = {
  children: ReactNode;
  /** Tab screens: the tab bar already owns the home-indicator inset. */
  insideTabs?: boolean;
};

/** The pinned action area: gutters at the sides, 16 pt above the home indicator. */
export function BottomCTA({ children, insideTabs = false }: BottomCTAProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        gap: spacing.xs,
        paddingHorizontal: spacing.gutter,
        paddingTop: spacing.item,
        paddingBottom: (insideTabs ? 0 : insets.bottom) + spacing.md,
        backgroundColor: colors.background,
      }}
    >
      {children}
    </View>
  );
}
