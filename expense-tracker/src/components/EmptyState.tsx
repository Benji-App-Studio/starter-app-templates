import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type EmptyStateProps = {
  /** A small SVG drawn in the palette; see `src/features/expenses/illustrations.tsx`. */
  illustration: ReactNode;
  title: string;
  body: string;
  action?: { title: string; onPress: () => void };
};

export function EmptyState({ illustration, title, body, action }: EmptyStateProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          gap: spacing.sm,
          paddingHorizontal: spacing.gutter,
          paddingTop: spacing.gutter,
          paddingBottom: action ? spacing.sm : spacing.gutter,
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={{ paddingBottom: spacing.sm }}>{illustration}</View>
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text color="muted" align="center">
        {body}
      </Text>
      {action ? <Button title={action.title} variant="ghost" onPress={action.onPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderWidth: 1,
  },
});
