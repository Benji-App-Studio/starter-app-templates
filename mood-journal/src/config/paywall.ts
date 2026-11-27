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
  /**
   * Free trial length shown on the paywall timeline and CTA. Set it to match the
   * introductory offer on the App Store product; leave it out for no trial.
   */
  trialDays?: number;
};

export const paywallConfig = {
  /**
   * 'revenuecat': the paywall designed in the RevenueCat dashboard (needs a key).
   * 'custom': the paywall in `src/features/paywall/CustomPaywall.tsx` (works with or without a key).
   * Without a key the custom paywall is always used.
   */
  ui: 'custom' as 'revenuecat' | 'custom',
  headline: 'Keep a year of you',
  subheadline: 'Every day is kept, and the patterns show.',
  benefits: [
    { icon: 'infinity', title: 'Every day, kept', body: 'Unlimited check-ins and a year in pixels' },
    { icon: 'trends', title: 'Patterns, not guesses', body: 'What lifts you and what weighs on you' },
    { icon: 'quote', title: 'A prompt that fits you', body: 'Gratitude or free writing, your pick' },
  ] satisfies { icon: IconName; title: string; body: string }[],
  plans: [
    { id: 'weekly', packageId: '$rc_weekly', title: 'Weekly', period: 'week', mockPrice: '$2.99' },
    {
      id: 'yearly',
      packageId: '$rc_annual',
      title: 'Yearly',
      period: 'year',
      mockPrice: '$39.99',
      badge: 'Best value',
      trialDays: 7,
    },
  ] satisfies PlanConfig[],
  defaultPlan: 'yearly' as PlanId,
  footnote: 'Cancel anytime in your App Store settings. Payment is charged to your Apple ID.',
};

export type PaywallBenefit = (typeof paywallConfig.benefits)[number];
