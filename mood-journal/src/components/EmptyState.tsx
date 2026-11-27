import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type EmptyStateProps = {
  /** A small SVG drawing in the palette. */
  illustration: ReactNode;
  title: string;
  body: string;
  action?: { title: string; onPress: () => void };
};

/** A drawing, one sentence, one action. Centered, because it is the only thing on the screen. */
export function EmptyState({ illustration, title, body, action }: EmptyStateProps) {
  const { spacing } = useTheme();

  return (
    <View style={[styles.root, { gap: spacing.lg, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg }]}>
      {illustration}
      <View style={[styles.copy, { gap: spacing.sm }]}>
        <Text variant="heading" align="center">
          {title}
        </Text>
        <Text color="muted" align="center">
          {body}
        </Text>
      </View>
      {action ? <Button title={action.title} onPress={action.onPress} variant="secondary" style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  copy: { alignItems: 'center', maxWidth: 300 },
  action: { alignSelf: 'center' },
});
