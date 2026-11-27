import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components';
import { spacing, useTheme } from '@/theme/theme';

import { protocols, type ProtocolId } from './protocols';

type ProtocolPickerProps = {
  value: ProtocolId;
  onChange: (id: ProtocolId) => void;
};

/** A row of plan chips: the ratio big, the name under it. */
export function ProtocolPicker({ value, onChange }: ProtocolPickerProps) {
  const { colors, radii, spacing } = useTheme();

  function select(id: ProtocolId) {
    if (id === value) return;
    void Haptics.selectionAsync();
    onChange(id);
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.gutter }}
      style={styles.scroll}
    >
      {protocols.map((protocol) => {
        const selected = protocol.id === value;
        return (
          <Pressable
            key={protocol.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${protocol.id}, ${protocol.name}`}
            onPress={() => select(protocol.id)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: selected ? colors.primarySoft : colors.surface,
                borderColor: selected ? colors.primary : 'transparent',
                borderRadius: radii.md,
                paddingHorizontal: spacing.md,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              variant="heading"
              color={selected ? 'text' : 'muted'}
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {protocol.id}
            </Text>
            <Text variant="caption" color="muted">
              {protocol.name}
            </Text>
          </Pressable>
        );
      })}
      <View style={{ width: spacing.xs }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  chip: {
    minHeight: 64,
    justifyContent: 'center',
    borderWidth: 1.5,
    gap: spacing.xs,
  },
});
