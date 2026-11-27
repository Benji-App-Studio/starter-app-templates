import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Row } from '@/components/Row';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type SectionProps = {
  title: string;
  /** A short note on the right of the title, e.g. "4 so far". */
  accessory?: string;
  /**
   * `group`: a small caps title over an inset list, like iOS Settings.
   * `heading`: a heading-size title over free content.
   */
  variant?: 'group' | 'heading';
  /** Put the content on a surface panel with inner padding. */
  card?: boolean;
  children: ReactNode;
};

/** A titled block. The title sits 12 pt above its content; sections are spaced by the parent's gap. */
export function Section({ title, accessory, variant = 'heading', card = false, children }: SectionProps) {
  const { colors, radii, spacing } = useTheme();
  const group = variant === 'group';

  return (
    <View style={{ gap: spacing.item }}>
      <Row justify="space-between" align="flex-end" gap="md" style={group ? { paddingHorizontal: spacing.xs } : null}>
        <Text
          variant={group ? 'overline' : 'heading'}
          color={group ? 'muted' : 'text'}
          numberOfLines={1}
          style={styles.title}
        >
          {group ? title.toUpperCase() : title}
        </Text>
        {accessory ? (
          <Text variant="caption" color="muted" numberOfLines={1}>
            {accessory}
          </Text>
        ) : null}
      </Row>
      {card ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
            paddingVertical: group ? 0 : spacing.md,
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

const styles = StyleSheet.create({
  title: { flex: 1, minWidth: 0 },
});
