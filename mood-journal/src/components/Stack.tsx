import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type spacing } from '@/theme/theme';

type Gap = keyof typeof spacing;

type StackProps = {
  children: ReactNode;
  /** Space between children, from the grid. Siblings never set their own margins. */
  gap?: Gap;
  align?: ViewStyle['alignItems'];
  style?: StyleProp<ViewStyle>;
};

/** Children in a column with an even gap. */
export function Stack({ children, gap = 'md', align, style }: StackProps) {
  const theme = useTheme();
  return <View style={[{ gap: theme.spacing[gap], alignItems: align }, style]}>{children}</View>;
}

type RowProps = StackProps & {
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
};

/** Children in a line, centered on one axis, with an even gap. */
export function Row({ children, gap = 'sm', align = 'center', justify, wrap = false, style }: RowProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
          gap: theme.spacing[gap],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
