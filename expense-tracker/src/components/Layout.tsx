import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type spacing as spacingTokens } from '@/theme/theme';

export type Gap = keyof typeof spacingTokens;

type StackProps = {
  children: ReactNode;
  /** Space between children, from the 8-pt grid. Siblings never set their own margins. */
  gap?: Gap;
  align?: ViewStyle['alignItems'];
  style?: StyleProp<ViewStyle>;
};

/** Children top to bottom, `gap` apart. */
export function Stack({ children, gap = 'sm', align, style }: StackProps) {
  const { spacing } = useTheme();
  return <View style={[{ gap: spacing[gap], alignItems: align }, style]}>{children}</View>;
}

type RowProps = StackProps & {
  justify?: ViewStyle['justifyContent'];
};

/** Children left to right on one center line, `gap` apart. */
export function Row({ children, gap = 'sm', align = 'center', justify, style }: RowProps) {
  const { spacing } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', gap: spacing[gap], alignItems: align, justifyContent: justify }, style]}>
      {children}
    </View>
  );
}
