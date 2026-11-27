import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type spacing } from '@/theme/theme';

type Gap = keyof typeof spacing;

type StackProps = {
  children: ReactNode;
  /** Space between children, from the spacing scale. Children never set their own margins. */
  gap?: Gap;
  align?: ViewStyle['alignItems'];
  style?: StyleProp<ViewStyle>;
};

/** Children top to bottom with a token gap between them. */
export function Stack({ children, gap = 'md', align, style }: StackProps) {
  const theme = useTheme();
  return <View style={[{ gap: theme.spacing[gap], alignItems: align }, style]}>{children}</View>;
}

type RowProps = StackProps & {
  justify?: ViewStyle['justifyContent'];
};

/** Children side by side, centred on one line, with a token gap between them. */
export function Row({ children, gap = 'sm', align = 'center', justify, style }: RowProps) {
  const theme = useTheme();
  return (
    <View style={[{ flexDirection: 'row', gap: theme.spacing[gap], alignItems: align, justifyContent: justify }, style]}>
      {children}
    </View>
  );
}
