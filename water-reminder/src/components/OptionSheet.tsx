import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Sheet } from '@/components/Sheet';
import { Text } from '@/components/Text';
import { useTheme, spacing } from '@/theme/theme';

export type SheetOption<T extends string | number> = {
  id: T;
  label: string;
  detail?: string;
};

type OptionSheetProps<T extends string | number> = {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: SheetOption<T>[];
  selected: T;
  onSelect: (id: T) => void;
};

/** A single-choice list in a sheet. Picking an option ticks, applies and closes. */
export function OptionSheet<T extends string | number>({
  visible,
  onClose,
  title,
  options,
  selected,
  onSelect,
}: OptionSheetProps<T>) {
  const { colors, radii, spacing } = useTheme();

  function handleSelect(id: T) {
    void Haptics.selectionAsync();
    onSelect(id);
    onClose();
  }

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={{ gap: spacing.xs }}>
        {options.map((option) => {
          const active = option.id === selected;
          return (
            <Pressable
              key={String(option.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => handleSelect(option.id)}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: active ? colors.primarySoft : pressed ? colors.surfaceRaised : 'transparent',
                  borderRadius: radii.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm + spacing.xs,
                },
              ]}
            >
              <View style={styles.body}>
                <Text variant="label" color={active ? 'primary' : 'text'}>
                  {option.label}
                </Text>
                {option.detail ? (
                  <Text variant="caption" color="muted">
                    {option.detail}
                  </Text>
                ) : null}
              </View>
              {active ? <Icon name="check" size={16} color={colors.primary} weight="bold" /> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  body: { flex: 1, gap: spacing.sm },
});
