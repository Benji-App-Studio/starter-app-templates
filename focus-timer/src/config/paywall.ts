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
  /** Free-trial length used by the mock paywall; the store product decides for real purchases. */
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
  headline: 'Your dial is ready',
  subheadline: 'Start the first session right after this.',
  benefits: [
    { icon: 'timer', text: 'Unlimited sessions, each with a label' },
    { icon: 'history', text: 'Day and week totals, and a streak' },
    { icon: 'bell', text: 'An alert when the dial runs out' },
    { icon: 'sliders', text: 'Your own focus and break lengths' },
  ] satisfies { icon: IconName; text: string }[],
  plans: [
    { id: 'weekly', packageId: '$rc_weekly', title: 'Weekly', period: 'week', mockPrice: '$2.99' },
    {
      id: 'yearly',
      packageId: '$rc_annual',
      title: 'Yearly',
      period: 'year',
      mockPrice: '$29.99',
      mockTrialDays: 7,
      badge: 'Best value',
    },
  ] satisfies PlanConfig[],
  defaultPlan: 'yearly' as PlanId,
  footnote: 'Cancel any time in your App Store settings. Payment is charged to your Apple ID.',
};
