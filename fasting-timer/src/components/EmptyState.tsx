import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type EmptyStateProps = {
  /** A small SVG drawn in the palette. */
  illustration: ReactNode;
  title: string;
  body: string;
  action?: { title: string; onPress: () => void };
};

export function EmptyState({ illustration, title, body, action }: EmptyStateProps) {
  const { spacing } = useTheme();

  return (
    <View style={[styles.root, { gap: spacing.lg, padding: spacing.lg }]}>
      {illustration}
      <View style={{ gap: spacing.sm }}>
        <Text variant="heading" align="center">
          {title}
        </Text>
        <Text color="muted" align="center" style={styles.body}>
          {body}
        </Text>
      </View>
      {action ? (
        <Button title={action.title} onPress={action.onPress} variant="secondary" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: { alignSelf: 'center' },
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { maxWidth: 280 },
});
