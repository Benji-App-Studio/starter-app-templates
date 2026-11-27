import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Stack } from '@/components/Layout';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type EmptyStateProps = {
  /** One of the SVGs in `illustrations.tsx`. */
  illustration: ReactNode;
  title: string;
  body: string;
  action?: { title: string; onPress: () => void };
};

/** Centred in the space it is given: illustration, one line of title, one sentence, one action. */
export function EmptyState({ illustration, title, body, action }: EmptyStateProps) {
  const { spacing } = useTheme();

  return (
    <View style={[styles.root, { padding: spacing.lg }]}>
      <Stack gap="md" align="center">
        {illustration}
        <Stack gap="sm" align="center">
          <Text variant="heading" align="center">
            {title}
          </Text>
          <Text color="muted" align="center" style={styles.body}>
            {body}
          </Text>
        </Stack>
        {action ? <Button title={action.title} onPress={action.onPress} variant="secondary" size="sm" /> : null}
      </Stack>
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
