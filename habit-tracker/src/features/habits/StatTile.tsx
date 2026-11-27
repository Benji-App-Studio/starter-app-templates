import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components';
import { useTheme } from '@/theme/theme';

type StatTileProps = {
  value: string;
  label: string;
};

/** A small numeral with a caption, three to a row. */
export function StatTile({ value, label }: StatTileProps) {
  const { spacing } = useTheme();

  return (
    <Card tone="sunken" style={[styles.tile, { gap: spacing.sm, padding: spacing.md }]}>
      <Text variant="numeralSmall" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {value}
      </Text>
      <Text variant="caption" color="muted" numberOfLines={2}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1 },
});
