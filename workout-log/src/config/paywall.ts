import type { IconName } from '@/components/icons';

export type PlanId = 'weekly' | 'yearly';

export type PlanConfig = {
  id: PlanId;
  /** RevenueCat package identifier inside the default offering. */
  packageId: string;
  title: string;
  /** Shown per period, e.g. "week" or "year". */
  period: string;
  /** Weeks the plan covers, for the per-week price and the saving. */
  weeks: number;
  /** Price used by the mock paywall when no RevenueCat key is set. */
  mockPrice: string;
  badge?: string;
};

export type PaywallBenefit = { icon: IconName; title: string; detail: string };

/**
 * Research price pattern for workout logs (Hevy, Strong): $2.99–4.99 a month,
 * $23.99–29.99 a year, no trial. The template keeps the weekly + yearly packages
 * from the contract; set the real prices in App Store Connect.
 */
export const paywallConfig = {
  /**
   * 'revenuecat': the paywall designed in the RevenueCat dashboard (needs a key).
   * 'custom': the paywall in `src/features/paywall/CustomPaywall.tsx` (works with or without a key).
   * Without a key the custom paywall is always used.
   */
  ui: 'revenuecat' as 'revenuecat' | 'custom',
  headline: 'Log it. Beat it.',
  subheadline: 'Every set, rest and record, kept on this phone.',
  benefits: [
    { icon: 'routines', title: 'Unlimited routines', detail: 'Any split, as many exercises as you need' },
    { icon: 'timer', title: 'Rest timer that starts itself', detail: 'Check a set and the clock is running' },
    { icon: 'trophy', title: 'Personal records', detail: 'Flagged the moment you beat one' },
  ] satisfies PaywallBenefit[],
  plans: [
    { id: 'weekly', packageId: '$rc_weekly', title: 'Weekly', period: 'week', weeks: 1, mockPrice: '$2.49' },
    {
      id: 'yearly',
      packageId: '$rc_annual',
      title: 'Yearly',
      period: 'year',
      weeks: 52,
      mockPrice: '$29.99',
      badge: 'Best value',
    },
  ] satisfies PlanConfig[],
  defaultPlan: 'yearly' as PlanId,
  /** `{price}` and `{period}` are filled from the selected plan. */
  cta: 'Start logging for {price} a {period}',
  footnote: 'Renews automatically. Cancel anytime in your App Store settings.',
};
