import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

type Align = ViewStyle['alignItems'];

import { spacing } from '@/theme/theme';

export type Space = keyof typeof spacing;

type StackProps = {
  children: ReactNode;
  /** Space between children, from `theme.spacing`. Siblings never set margins on each other. */
  gap?: Space;
  align?: Align;
  justify?: ViewStyle['justifyContent'];
  /** Take the remaining space in the parent. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Children top to bottom with a token gap. */
export function Stack({ children, gap = 'sm', align, justify, fill = false, style, accessibilityLabel }: StackProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        { gap: spacing[gap], alignItems: align, justifyContent: justify },
        fill && { flex: 1, minWidth: 0 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type RowProps = Omit<StackProps, 'align'> & {
  /** Defaults to centring children on one line. */
  align?: Align;
};

/** Children left to right with a token gap, centred vertically. */
export function Row({
  children,
  gap = 'sm',
  align = 'center',
  justify,
  fill = false,
  style,
  accessibilityLabel,
}: RowProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        { flexDirection: 'row', gap: spacing[gap], alignItems: align, justifyContent: justify },
        fill && { flex: 1, minWidth: 0 },
        style,
      ]}
    >
      {children}
    </View>
  );
}
