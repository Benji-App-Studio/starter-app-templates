import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChoiceRow, Stack, Text } from '@/components';
import type { IconName } from '@/components';
import { useTheme } from '@/theme/theme';

type PickerOption = { id: string; label: string; hint?: string; icon?: IconName };

type PickerSheetProps = {
  title: string;
  options: PickerOption[];
  selectedId: string;
  onSelect: (id: string) => void;
};

/** A bottom sheet of single-choice rows. Selecting one saves and closes the sheet. */
export function PickerSheet({ title, options, selectedId, onSelect }: PickerSheetProps) {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingHorizontal: spacing.gutter,
        paddingTop: spacing.xl,
        paddingBottom: insets.bottom + spacing.md,
        gap: spacing.lg,
        backgroundColor: colors.background,
      }}
    >
      <Text variant="title" numberOfLines={2}>
        {title}
      </Text>
      <Stack gap="item">
        {options.map((option) => (
          <ChoiceRow
            key={option.id}
            label={option.label}
            hint={option.hint}
            icon={option.icon}
            selected={option.id === selectedId}
            onPress={() => {
              onSelect(option.id);
              router.back();
            }}
          />
        ))}
      </Stack>
    </View>
  );
}
