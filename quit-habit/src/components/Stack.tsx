import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type SpacingKey } from '@/theme/theme';

type StackProps = {
  children: ReactNode;
  /** Space between children, from the spacing scale. Siblings never set their own margins. */
  gap?: SpacingKey;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  /** Take the remaining height of the parent. */
  grow?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A vertical group whose spacing comes only from `gap`. */
export function Stack({ children, gap = 'sm', align, justify, grow = false, style }: StackProps) {
  const { spacing } = useTheme();

  return (
    <View
      style={[
        { gap: spacing[gap], alignItems: align, justifyContent: justify },
        grow ? { flexGrow: 1 } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}
