import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type StatProps = {
  label: string;
  value: string;
  unit?: string;
  tone?: 'text' | 'primary' | 'pr';
  style?: StyleProp<ViewStyle>;
};

/** A labelled number in the condensed face. Used in rows of three or four. */
export function Stat({ label, value, unit, tone = 'text', style }: StatProps) {
  const { spacing } = useTheme();
  // Stats sit in equal columns; the number shrinks before it would collide with its neighbour.

  return (
    <View style={[{ gap: spacing.xs }, style]}>
      <Text variant="overline" color="muted" numberOfLines={1}>
        {label}
      </Text>
      <View style={[styles.valueRow, { gap: spacing.xs, paddingRight: spacing.sm }]}>
        <Text variant="numeralSmall" color={tone} style={styles.value}>
          {value}
        </Text>
        {unit ? (
          <Text variant="caption" color="muted">
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  valueRow: { flexDirection: 'row', alignItems: 'baseline' },
  value: { flexShrink: 1 },
});
