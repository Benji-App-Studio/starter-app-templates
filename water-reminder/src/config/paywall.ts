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

export const paywallConfig = {
  /**
   * 'revenuecat': the paywall designed in the RevenueCat dashboard (needs a key).
   * 'custom': the paywall in `src/features/paywall/CustomPaywall.tsx` (works with or without a key).
   * Without a key the custom paywall is always used.
   */
  ui: 'revenuecat' as 'revenuecat' | 'custom',
  /** `{goal}` is replaced with the user's daily goal, e.g. "2.75 L". */
  headline: 'Your {goal} plan is ready',
  subheadline: 'Sipwell keeps the glass filling until the goal is met.',
  benefits: [
    { icon: 'bell', text: 'Gentle nudges from {start} to {end}' },
    { icon: 'glass', text: 'One tap for every cup you drink' },
    { icon: 'chart', text: 'A week chart and a streak to keep' },
    { icon: 'target', text: 'A goal built from your three answers' },
  ] as { icon: 'bell' | 'glass' | 'chart' | 'target'; text: string }[],
  plans: [
    { id: 'weekly', packageId: '$rc_weekly', title: 'Weekly', period: 'week', mockPrice: '$1.99' },
    {
      id: 'yearly',
      packageId: '$rc_annual',
      title: 'Yearly',
      period: 'year',
      mockPrice: '$19.99',
      badge: 'Best value',
    },
  ] satisfies PlanConfig[],
  defaultPlan: 'yearly' as PlanId,
  /**
   * The free trial attached to the yearly plan. Match it to the introductory offer
   * you create in App Store Connect, or set `days` to 0 to sell without a trial.
   */
  trial: { planId: 'yearly' as PlanId, days: 7 },
  footnote: 'Cancel anytime in your App Store settings. Payment is charged to your Apple ID.',
};
