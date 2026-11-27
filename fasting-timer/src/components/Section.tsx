import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Row, Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type SectionProps = {
  title: string;
  children: ReactNode;
  /** A small control on the right of the title, e.g. "Log a past fast". */
  action?: ReactNode;
  /** Grouped inset rows: the children sit on one rounded surface. */
  grouped?: boolean;
};

/** A caption title 12 pt above its content. Screens stack sections with a 24–32 pt gap. */
export function Section({ title, children, action, grouped = false }: SectionProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <Stack gap="ms">
      <Row gap="sm" justify="space-between" style={{ minHeight: spacing.lg }}>
        <Text variant="caption" color="muted" numberOfLines={1}>
          {title.toUpperCase()}
        </Text>
        {action}
      </Row>
      {grouped ? (
        <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, paddingHorizontal: spacing.md }}>
          {children}
        </View>
      ) : (
        children
      )}
    </Stack>
  );
}
