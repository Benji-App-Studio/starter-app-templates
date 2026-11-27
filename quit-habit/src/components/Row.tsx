import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type SpacingKey } from '@/theme/theme';

type RowProps = {
  children: ReactNode;
  gap?: SpacingKey;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A horizontal group, centered on one line by default, spaced by `gap`. */
export function Row({ children, gap = 'sm', align = 'center', justify, wrap = false, style }: RowProps) {
  const { spacing } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: spacing[gap],
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
