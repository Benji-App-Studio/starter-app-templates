import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type SectionProps = {
  title: string;
  /** Sits on the title line, right-aligned (a hint or a small control). */
  trailing?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** A titled block. The title sits 12 pt above its content; screens space sections with their own gap. */
export function Section({ title, trailing, children, style }: SectionProps) {
  const { spacing } = useTheme();
  return (
    <View style={[{ gap: spacing.ms }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Text variant="eyebrow" color="muted" style={{ flex: 1 }} numberOfLines={1}>
          {title.toUpperCase()}
        </Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}
