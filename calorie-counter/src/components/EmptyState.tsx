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
  /** 'inline' puts the drawing beside the copy, for a screen whose hero already fills most of it. */
  layout?: 'stacked' | 'inline';
};

export function EmptyState({ illustration, title, body, action, layout = 'stacked' }: EmptyStateProps) {
  const { spacing } = useTheme();

  if (layout === 'inline') {
    return (
      <View style={[styles.inline, { gap: spacing.md }]}>
        {illustration}
        <View style={[styles.inlineCopy, { gap: spacing.xs }]}>
          <Text variant="heading">{title}</Text>
          <Text color="muted">{body}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
      {illustration}
      <View style={[styles.copy, { gap: spacing.sm }]}>
        <Text variant="heading" align="center">
          {title}
        </Text>
        <Text color="muted" align="center">
          {body}
        </Text>
      </View>
      {action ? <Button title={action.title} onPress={action.onPress} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { alignSelf: 'stretch' },
  inline: { flexDirection: 'row', alignItems: 'center' },
  inlineCopy: { flex: 1, minWidth: 0 },
  action: { alignSelf: 'stretch' },
});
