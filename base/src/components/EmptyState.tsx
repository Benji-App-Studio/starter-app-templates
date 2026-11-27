import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import type { IconName } from '@/components/icons';
import { useTheme } from '@/theme/theme';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  body: string;
  action?: { title: string; onPress: () => void };
};

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={[styles.root, { gap: spacing.md, padding: spacing.lg }]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.primarySoft, borderRadius: radii.pill },
        ]}
      >
        <Ionicons name={icon} size={36} color={colors.primary} />
      </View>
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text color="muted" align="center">
        {body}
      </Text>
      {action ? (
        <Button title={action.title} onPress={action.onPress} style={{ marginTop: spacing.sm }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
