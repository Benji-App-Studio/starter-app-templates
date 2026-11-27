import { StyleSheet, View } from 'react-native';

import { Text } from '@/components';
import { spacing as grid, useTheme } from '@/theme/theme';

import type { Macros } from './target';

type MacroLegendProps = {
  eaten: Macros;
  targets: Macros;
};

/** Protein, carbs and fat in grams against their targets, in the ring colors. */
export function MacroLegend({ eaten, targets }: MacroLegendProps) {
  const { colors, spacing } = useTheme();
  const rows: { key: keyof Macros; label: string; color: string }[] = [
    { key: 'protein', label: 'Protein', color: colors.protein },
    { key: 'carbs', label: 'Carbs', color: colors.carbs },
    { key: 'fat', label: 'Fat', color: colors.fat },
  ];

  return (
    <View style={[styles.row, { gap: spacing.sm }]}>
      {rows.map((row) => (
        <View key={row.key} style={styles.cell}>
          <View style={[styles.labelRow, { gap: spacing.xs }]}>
            <View style={[styles.dot, { backgroundColor: row.color }]} />
            <Text variant="caption" color="muted">
              {row.label}
            </Text>
          </View>
          <Text variant="label" style={styles.tabular} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {Math.round(eaten[row.key])}
            <Text variant="caption" color="muted">
              {' '}
              / {targets[row.key]} g
            </Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: { flex: 1, minWidth: 0, alignItems: 'center', gap: grid.xs },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tabular: { fontVariant: ['tabular-nums'] },
});
