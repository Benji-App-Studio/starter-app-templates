import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button, Icon, Keypad, Screen, SheetHeader, Stack, Text, type KeypadKey } from '@/components';
import { categoryById } from '@/features/expenses/categories';
import { saveBudget, useBudgetPeriod, usePeriodSummary } from '@/features/expenses/data';
import { applyKey, centsToTyped, formatMoney, formatTyped, typedToCents } from '@/features/expenses/money';
import { usePreferences } from '@/features/expenses/preferences';
import { useTheme } from '@/theme/theme';

type BudgetEditorScreenProps = {
  categoryId: string;
};

/** Sheet for one category's monthly limit, on the same keypad as expenses. */
export function BudgetEditorScreen({ categoryId }: BudgetEditorScreenProps) {
  const router = useRouter();
  const { colors, categoryTints, radii, sizes, spacing } = useTheme();
  const { currency } = usePreferences();
  const period = useBudgetPeriod();
  const summary = usePeriodSummary(period);
  const category = categoryById(categoryId);
  const currentLimit = summary?.monthlyLimits[category.id] ?? 0;
  const spent = summary?.spentByCategory[category.id] ?? 0;

  const [typed, setTyped] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (summary && typed === undefined) {
      setTyped(centsToTyped(currentLimit));
    }
  }, [summary, currentLimit, typed]);

  const value = typed ?? '';
  const limitCents = typedToCents(value);

  function handleKey(key: KeypadKey) {
    setTyped((current) => applyKey(current ?? '', key));
  }

  async function commit(cents: number) {
    setSaving(true);
    try {
      await saveBudget(category.id, cents);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      setSaving(false);
      Alert.alert('Could not save', 'Please try again.');
    }
  }

  function handleRemove() {
    Alert.alert(`Remove the ${category.label} limit?`, 'Spending still counts toward the month.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => void commit(0) },
    ]);
  }

  return (
    <Screen sheet contentStyle={{ gap: spacing.md }}>
      <SheetHeader
        title={category.label}
        onClose={() => router.back()}
        action={
          currentLimit > 0
            ? { icon: 'trash', label: 'Remove limit', destructive: true, onPress: handleRemove }
            : undefined
        }
      />

      <Stack gap="xs" align="center">
        <View
          style={[
            styles.badge,
            { width: sizes.badgeLarge, height: sizes.badgeLarge, backgroundColor: categoryTints[category.tint], borderRadius: radii.pill },
          ]}
        >
          <Icon name={category.icon} size={22} color={colors.onTint} weight="semibold" />
        </View>
        <Text variant="eyebrow" color="muted" style={{ marginTop: spacing.sm }}>
          MONTHLY LIMIT
        </Text>
        <Text
          variant="numeralSheet"
          color={value ? 'text' : 'muted'}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {formatTyped(value, currency)}
        </Text>
        <Text color="muted" numberOfLines={1}>
          {formatMoney(spent, currency)} spent so far this month
        </Text>
      </Stack>

      <Keypad onKey={handleKey} onClear={() => setTyped('')} />

      <Button
        title="Save limit"
        onPress={() => void commit(limitCents)}
        disabled={summary === undefined || limitCents === 0 || saving}
        loading={saving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});
