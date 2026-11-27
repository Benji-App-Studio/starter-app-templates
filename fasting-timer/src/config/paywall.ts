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

export type Benefit = {
  icon: IconName;
  title: string;
  detail: string;
};

export const paywallConfig = {
  /**
   * 'revenuecat': the paywall designed in the RevenueCat dashboard (needs a key).
   * 'custom': the paywall in `src/features/paywall/CustomPaywall.tsx` (works with or without a key).
   * Without a key the custom paywall is always used.
   */
  ui: 'custom' as 'revenuecat' | 'custom',
  /** `{plan}` becomes the user's plan, e.g. "16:8". */
  headline: 'Your {plan} plan is ready',
  subheadline: 'A ring, a timer, a streak. Nothing to log.',
  benefits: [
    { icon: 'timer', title: 'Six plans, one ring', detail: '12:12 to one meal a day. Switch even mid-fast.' },
    { icon: 'bell', title: 'Know the moment it ends', detail: 'An alert at the goal, a reminder to start.' },
    { icon: 'flame', title: 'Streaks and history', detail: 'Every fast saved on your phone.' },
    { icon: 'moon', title: 'Built for the night', detail: 'Dark and quiet, easy to check at 11 PM.' },
  ] satisfies Benefit[],
  plans: [
    { id: 'weekly', packageId: '$rc_weekly', title: 'Weekly', period: 'week', mockPrice: '$4.99' },
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
  /** `{price}` and `{period}` become the selected plan's values. */
  cta: 'Start fasting · {price} a {period}',
  footnote: 'Renews automatically until cancelled in your App Store settings. Charged to your Apple ID.',
};
