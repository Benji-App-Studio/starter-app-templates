import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type ScreenHeaderProps = {
  title: string;
  /** Shows a back chevron on the left. */
  onBack?: () => void;
  /** Shows a close button on the right (sheets). */
  onClose?: () => void;
};

export function ScreenHeader({ title, onBack, onClose }: ScreenHeaderProps) {
  const { colors, radii } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={onBack}>
            <Icon name="back" size={20} color={colors.text} weight="semibold" />
          </Pressable>
        ) : null}
      </View>
      <Text variant="heading" align="center" numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>
        {onClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={10}
            onPress={onClose}
            style={[styles.close, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.pill }]}
          >
            <Icon name="close" size={14} color={colors.text} weight="bold" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  side: { width: 44, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  title: { flex: 1 },
  close: { width: 32, height: 32, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
