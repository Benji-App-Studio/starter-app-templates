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
  /** Free-trial length the mock paywall shows. With RevenueCat the store product decides. */
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
  /** Used when no habits exist yet; otherwise the headline names how many are ready. */
  headline: 'Keep every streak alive',
  /** Follows the personalised line about the check-in time when habits exist. */
  subheadline: 'Free for a week.',
  benefits: [
    { icon: 'infinity', text: 'Unlimited habits, on the days you pick' },
    { icon: 'flame', text: 'Streaks and a year grid for every habit' },
    { icon: 'bell', text: 'A reminder at your check-in time' },
    { icon: 'lock', text: 'Stays on your phone. No account' },
  ],
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
  /** Used when the selected plan has no trial. */
  cta: 'Continue',
  footnote: 'Cancel anytime in Settings. Charged to your Apple ID.',
};
