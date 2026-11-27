import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Sheet } from '@/components/Sheet';
import { Text } from '@/components/Text';
import type { IconName } from '@/components/icons';
import { useTheme } from '@/theme/theme';

export type SheetOption<T extends string> = {
  id: T;
  label: string;
  detail?: string;
  icon?: IconName;
  destructive?: boolean;
};

type OptionSheetProps<T extends string> = {
  visible: boolean;
  title: string;
  options: SheetOption<T>[];
  /** The option shown as selected (a settings choice). Omit for an action menu. */
  value?: T;
  onSelect: (id: T) => void;
  onDismiss: () => void;
};

/** A titled list of choices or actions in a bottom sheet. */
export function OptionSheet<T extends string>({ visible, title, options, value, onSelect, onDismiss }: OptionSheetProps<T>) {
  const { colors, radii, spacing } = useTheme();

  return (
    <Sheet visible={visible} onDismiss={onDismiss}>
      <Text variant="heading" numberOfLines={2} style={{ marginBottom: spacing.smd }}>
        {title}
      </Text>
      <View style={{ borderRadius: radii.lg, backgroundColor: colors.surfaceRaised, paddingHorizontal: spacing.md }}>
        {options.map((option, index) => {
          const selected = option.id === value;
          const tint = option.destructive ? colors.danger : colors.text;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                void Haptics.selectionAsync();
                onSelect(option.id);
              }}
              style={({ pressed }) => [
                styles.row,
                {
                  gap: spacing.smd,
                  paddingVertical: spacing.smd,
                  borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                  borderTopColor: colors.border,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              {option.icon ? <Icon name={option.icon} size={20} color={option.destructive ? colors.danger : colors.textMuted} /> : null}
              <View style={[styles.body, { gap: spacing.xs }]}>
                <Text style={{ color: tint }} numberOfLines={1}>
                  {option.label}
                </Text>
                {option.detail ? (
                  <Text variant="caption" color="muted">
                    {option.detail}
                  </Text>
                ) : null}
              </View>
              {selected ? <Icon name="check" size={18} color={colors.accentText} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center' },
  body: { flex: 1, minWidth: 0 },
});
