import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type EmptyStateProps = {
  /** A small SVG drawn in the palette; see `NightIllustration`. */
  illustration: ReactNode;
  title: string;
  body: string;
  action?: { title: string; onPress: () => void };
};

export function EmptyState({ illustration, title, body, action }: EmptyStateProps) {
  const { spacing } = useTheme();

  return (
    <View style={[styles.root, { gap: spacing.sm, padding: spacing.lg }]}>
      <View style={{ marginBottom: spacing.md }}>{illustration}</View>
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text color="muted" align="center" style={styles.body}>
        {body}
      </Text>
      {action ? (
        <Button
          title={action.title}
          variant="secondary"
          onPress={action.onPress}
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { maxWidth: 280 },
});
