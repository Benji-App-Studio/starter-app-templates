import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { spacing as spacingScale } from '@/theme/theme';

type Gap = keyof typeof spacingScale;

type LayoutProps = Omit<ViewProps, 'style'> & {
  children?: ReactNode;
  /** Space between children, from the spacing scale. Siblings never set their own margins. */
  gap?: Gap;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  /** Take the remaining space in the parent. */
  grow?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Children stacked vertically with a token gap. */
export function Stack({ children, gap = 'sm', align, justify, grow, style, ...rest }: LayoutProps) {
  return (
    <View
      {...rest}
      style={[
        { gap: spacingScale[gap], alignItems: align, justifyContent: justify },
        grow ? { flex: 1 } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Children in a row, centred on one line, with a token gap. */
export function Row({ children, gap = 'sm', align = 'center', justify, grow, style, ...rest }: LayoutProps) {
  return (
    <View
      {...rest}
      style={[
        { flexDirection: 'row', gap: spacingScale[gap], alignItems: align, justifyContent: justify },
        grow ? { flex: 1 } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}
