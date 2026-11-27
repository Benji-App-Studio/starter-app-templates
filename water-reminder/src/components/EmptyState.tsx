import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type EmptyStateProps = {
  /** A small SVG drawn in the palette, e.g. from `src/features/hydration/illustrations.tsx`. */
  illustration: ReactNode;
  title: string;
  body: string;
  action?: { title: string; onPress: () => void };
  /** Fill the parent (full-screen empty state) or sit inline inside a list. */
  inline?: boolean;
};

export function EmptyState({ illustration, title, body, action, inline = false }: EmptyStateProps) {
  const { spacing } = useTheme();

  return (
    <View style={[inline ? styles.inline : styles.full, { gap: spacing.sm, padding: spacing.lg }]}>
      <View style={{ marginBottom: spacing.sm }}>{illustration}</View>
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text color="muted" align="center">
        {body}
      </Text>
      {action ? (
        <Button
          variant="secondary"
          title={action.title}
          onPress={action.onPress}
          style={{ marginTop: spacing.sm, alignSelf: 'center' }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
