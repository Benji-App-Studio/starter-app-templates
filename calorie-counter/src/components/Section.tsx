import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type SectionProps = {
  title: string;
  children: ReactNode;
  /** Puts the children in one bordered surface, like a grouped settings list. */
  grouped?: boolean;
  /** Small text on the right of the title, e.g. a unit. */
  trailing?: string;
};

/** A titled block. The title sits 12 pt above its content; screens space sections with `Stack gap="xl"`. */
export function Section({ title, children, grouped = false, trailing }: SectionProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.ms }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, paddingHorizontal: spacing.xs }}>
        <Text variant="overline" color="muted" style={{ flex: 1 }}>
          {title.toUpperCase()}
        </Text>
        {trailing ? (
          <Text variant="caption" color="muted">
            {trailing}
          </Text>
        ) : null}
      </View>
      {grouped ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: spacing.md,
          }}
        >
          {children}
        </View>
      ) : (
        children
      )}
    </View>
  );
}
