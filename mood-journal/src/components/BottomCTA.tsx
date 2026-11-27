import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/theme';

type BottomCTAProps = {
  children: ReactNode;
  /** Painted behind the CTA so scrolling content passes under it cleanly. */
  backgroundColor?: string;
};

/** The pinned action area: gutter on both sides, 16 pt above the home indicator. */
export function BottomCTA({ children, backgroundColor }: BottomCTAProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        backgroundColor: backgroundColor ?? colors.background,
        paddingHorizontal: spacing.gutter,
        paddingTop: spacing.ms,
        paddingBottom: insets.bottom + spacing.md,
        gap: spacing.ms,
      }}
    >
      {children}
    </View>
  );
}
