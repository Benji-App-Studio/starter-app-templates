import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  /** Unit shown after the value, e.g. "kcal" or "g". */
  suffix?: string;
};

export function TextField({ label, suffix, style, ...rest }: TextFieldProps) {
  const { colors, radii, spacing, typography } = useTheme();

  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="caption" color="muted">
        {label}
      </Text>
      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
            gap: spacing.sm,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          {...rest}
          style={[styles.input, typography.body, { color: colors.text }, style]}
        />
        {suffix ? (
          <Text variant="caption" color="muted">
            {suffix}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderWidth: 1,
  },
  input: { flex: 1, paddingVertical: 0 },
});
