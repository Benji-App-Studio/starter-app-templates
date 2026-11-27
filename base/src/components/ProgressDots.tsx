import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/theme';

type ProgressDotsProps = {
  count: number;
  /** Zero-based. */
  current: number;
};

export function ProgressDots({ count, current }: ProgressDotsProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View accessibilityLabel={`Step ${current + 1} of ${count}`} style={[styles.row, { gap: spacing.sm }]}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={{
            width: index === current ? 24 : 8,
            height: 8,
            borderRadius: radii.pill,
            backgroundColor: index === current ? colors.primary : colors.border,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
