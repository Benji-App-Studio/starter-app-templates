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
  /** Free trial length the mock paywall shows; the real one comes from the store product. */
  mockTrialDays?: number;
  badge?: string;
};

export const paywallConfig = {
  /**
   * 'revenuecat': the paywall designed in the RevenueCat dashboard (needs a key).
   * 'custom': the paywall in `src/features/paywall/CustomPaywall.tsx` (works with or without a key).
   * Without a key the custom paywall is always used.
   */
  ui: 'revenuecat' as 'revenuecat' | 'custom',
  /** `{target}` is replaced with the daily calorie target from onboarding. */
  headline: 'Your {target} kcal plan is ready',
  subheadline: 'Log a meal in seconds. The ring keeps you honest.',
  benefits: [
    { icon: 'infinity', text: 'Unlimited food logging, every day' },
    { icon: 'target', text: 'A daily target built from your goal' },
    { icon: 'macros', text: 'Protein, carbs and fat on their own rings' },
    { icon: 'history', text: 'Every day in detail, two weeks at a glance' },
  ] satisfies { icon: IconName; text: string }[],
  plans: [
    { id: 'weekly', packageId: '$rc_weekly', title: 'Weekly', period: 'week', mockPrice: '$5.99' },
    {
      id: 'yearly',
      packageId: '$rc_annual',
      title: 'Yearly',
      period: 'year',
      mockPrice: '$39.99',
      mockTrialDays: 3,
      badge: 'Best value',
    },
  ] satisfies PlanConfig[],
  defaultPlan: 'yearly' as PlanId,
  footnote: 'Cancel anytime in your App Store settings. Payment is charged to your Apple ID.',
};
