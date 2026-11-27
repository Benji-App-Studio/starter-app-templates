import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components';
import { appConfig } from '@/config/app';
import { paywallConfig, type PlanId } from '@/config/paywall';
import { getPlans, purchase, restore, type Plan } from '@/purchases';
import { useTheme } from '@/theme/theme';

/**
 * The built-in paywall. Shown when no RevenueCat key is set (mock purchases),
 * or when `paywallConfig.ui` is 'custom'. There is no close button on purpose.
 */
export function CustomPaywall() {
  const { colors, radii, spacing } = useTheme();
  const [plans, setPlans] = useState<Plan[]>();
  const [selected, setSelected] = useState<PlanId>(paywallConfig.defaultPlan);
  const [busy, setBusy] = useState<'purchase' | 'restore'>();

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => Alert.alert('Could not load plans', 'Check your connection and try again.'));
  }, []);

  async function handlePurchase() {
    setBusy('purchase');
    try {
      await purchase(selected);
    } catch {
      Alert.alert('Purchase failed', 'Nothing was charged. Please try again.');
    } finally {
      setBusy(undefined);
    }
  }

  async function handleRestore() {
    setBusy('restore');
    try {
      const entitled = await restore();
      if (!entitled) {
        Alert.alert('Nothing to restore', 'No active subscription was found for this account.');
      }
    } catch {
      Alert.alert('Restore failed', 'Please try again.');
    } finally {
      setBusy(undefined);
    }
  }

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      footer={
        <View style={{ gap: spacing.md }}>
          <Button
            title={paywallConfig.cta}
            onPress={handlePurchase}
            loading={busy === 'purchase'}
            disabled={!plans || busy === 'restore'}
          />
          <Text variant="caption" color="muted" align="center">
            {paywallConfig.footnote}
          </Text>
          <View style={[styles.links, { gap: spacing.md }]}>
            <Pressable onPress={handleRestore} disabled={busy !== undefined}>
              <Text variant="caption" color="primary">
                Restore purchases
              </Text>
            </Pressable>
            <Pressable onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)}>
              <Text variant="caption" color="muted">
                Terms
              </Text>
            </Pressable>
            <Pressable onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)}>
              <Text variant="caption" color="muted">
                Privacy
              </Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        <Text variant="display">{paywallConfig.headline}</Text>
        <Text color="muted">{paywallConfig.subheadline}</Text>
      </View>

      <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
        {paywallConfig.benefits.map((benefit) => (
          <View key={benefit} style={[styles.benefit, { gap: spacing.sm }]}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
        {plans ? (
          plans.map((plan) => (
            <Card key={plan.id} selected={plan.id === selected} onPress={() => setSelected(plan.id)}>
              <View style={styles.planRow}>
                <View style={styles.planBody}>
                  <Text variant="label">{plan.title}</Text>
                  <Text variant="caption" color="muted">
                    {plan.price} / {plan.period}
                  </Text>
                </View>
                {plan.badge ? (
                  <View
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: radii.pill,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                    }}
                  >
                    <Text variant="caption" color="onPrimary">
                      {plan.badge}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Card>
          ))
        ) : (
          <ActivityIndicator style={{ marginVertical: spacing.lg }} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  benefit: { flexDirection: 'row', alignItems: 'center' },
  benefitText: { flex: 1 },
  links: { flexDirection: 'row', justifyContent: 'center' },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planBody: { flex: 1, gap: 2 },
});
