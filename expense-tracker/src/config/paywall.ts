import type { IconName } from '@/components';

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
  /** Free trial length the mock paywall shows. Real trials come from the store product. */
  trialDays?: number;
  badge?: string;
};

export const paywallConfig = {
  /**
   * 'revenuecat': the paywall designed in the RevenueCat dashboard (needs a key).
   * 'custom': the paywall in `src/features/paywall/CustomPaywall.tsx` (works with or without a key).
   * Without a key the custom paywall is always used.
   */
  ui: 'revenuecat' as 'revenuecat' | 'custom',
  headline: 'Your plan is ready',
  subheadline: 'Log in three taps. End the month with money left.',
  benefits: [
    { icon: 'infinity', text: 'Unlimited expenses and history' },
    { icon: 'trend', text: 'A daily number that moves with you' },
    { icon: 'report', text: 'Monthly reports by category' },
  ] satisfies { icon: IconName; text: string }[],
  plans: [
    { id: 'weekly', packageId: '$rc_weekly', title: 'Weekly', period: 'week', mockPrice: '$2.99' },
    {
      id: 'yearly',
      packageId: '$rc_annual',
      title: 'Yearly',
      period: 'year',
      mockPrice: '$39.99',
      trialDays: 7,
      badge: 'Best value',
    },
  ] satisfies PlanConfig[],
  defaultPlan: 'yearly' as PlanId,
  /** Button label when the selected plan has no trial. */
  cta: 'Continue',
  footnote: 'Cancel anytime in your App Store settings. Payment is charged to your Apple ID.',
};
