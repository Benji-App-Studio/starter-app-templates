import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type SheetHeaderProps = {
  title: string;
  onClose: () => void;
  /** Optional icon action on the right, e.g. delete. */
  action?: { icon: IconName; label: string; destructive?: boolean; onPress: () => void };
};

/** Top row of a form sheet: close on the left, title centred, one action on the right. */
export function SheetHeader({ title, onClose, action }: SheetHeaderProps) {
  const { colors, radii } = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={8}
        onPress={onClose}
        style={({ pressed }) => [
          styles.circle,
          { backgroundColor: colors.background, borderRadius: radii.pill, opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Icon name="close" size={16} color={colors.text} weight="bold" />
      </Pressable>
      <Text variant="heading" align="center" style={styles.title}>
        {title}
      </Text>
      {action ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action.label}
          hitSlop={8}
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.circle,
            {
              backgroundColor: action.destructive ? colors.dangerSoft : colors.background,
              borderRadius: radii.pill,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Icon
            name={action.icon}
            size={16}
            color={action.destructive ? colors.danger : colors.text}
            weight="semibold"
          />
        </Pressable>
      ) : (
        <View style={styles.circle} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1 },
  circle: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
