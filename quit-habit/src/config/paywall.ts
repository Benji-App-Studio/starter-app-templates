import type { IconName } from '@/components/icons';

export type PlanId = 'weekly' | 'yearly';

export type PlanConfig = {
  id: PlanId;
  /** RevenueCat package identifier inside the default offering. */
  packageId: string;
  title: string;
  /** Shown per period, e.g. "week" or "year". */
  period: string;
  /** Price used by the mock paywall when no RevenueCat key is set. */
  mockPrice: string;
  badge?: string;
};

export type PaywallBenefit = { icon: IconName; title: string; body: string };

export const paywallConfig = {
  /**
   * 'revenuecat': the paywall designed in the RevenueCat dashboard (needs a key).
   * 'custom': the paywall in `src/features/paywall/CustomPaywall.tsx` (works with or without a key).
   * Without a key the custom paywall is always used.
   */
  ui: 'revenuecat' as 'revenuecat' | 'custom',
  headline: 'Your counter is ready',
  /** `{money}` and `{units}` are filled from the onboarding answers. */
  subheadline: 'Each day free adds {money} and {units}.',
  benefits: [
    { icon: 'timer', title: 'A counter that never stops', body: 'Time, money and units, live to the second.' },
    { icon: 'wind', title: 'The craving button', body: 'One minute of slow breathing when it hits.' },
    { icon: 'flag', title: 'Ten milestones', body: 'From 12 hours to a year, each one marked.' },
    { icon: 'history', title: 'History that survives a slip', body: 'Every attempt kept; nothing is wiped.' },
  ] satisfies PaywallBenefit[],
  plans: [
    { id: 'weekly', packageId: '$rc_weekly', title: 'Weekly', period: 'week', mockPrice: '$5.99' },
    {
      id: 'yearly',
      packageId: '$rc_annual',
      title: 'Yearly',
      period: 'year',
      mockPrice: '$39.99',
      badge: 'Best value',
    },
  ] satisfies PlanConfig[],
  defaultPlan: 'yearly' as PlanId,
  /** `{price}` and `{period}` are filled from the selected plan. */
  cta: 'Start for {price} a {period}',
  footnote: 'Cancel anytime in your App Store settings. Payment is charged to your Apple ID.',
};
