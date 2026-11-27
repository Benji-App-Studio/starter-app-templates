import type { IconName } from '@/components/icons';

export type PlanId = 'weekly' | 'yearly';

export type PlanConfig = {
  id: PlanId;
  /** RevenueCat package identifier inside the default offering. */
  packageId: string;
  title: string;
  /** Shown per period, e.g. "week" or "year". */
  period: string;
  /** How many weeks the period covers; used for the per-week price and the saving. */
  weeks: number;
  /** Price used by the mock paywall when no RevenueCat key is set. */
  mockPrice: string;
  /** Free days before the first charge. Must match the introductory offer on the store product. */
  trialDays?: number;
  badge?: string;
};

export type Benefit = { icon: IconName; title: string; body: string };

export const paywallConfig = {
  /**
   * 'revenuecat': the paywall designed in the RevenueCat dashboard (needs a key).
   * 'custom': the paywall in `src/features/paywall/CustomPaywall.tsx` (works with or without a key).
   * Without a key the custom paywall is always used.
   */
  ui: 'custom' as 'revenuecat' | 'custom',
  headline: 'Your night mix is ready',
  subheadline: 'Free for your first seven nights.',
  benefits: [
    { icon: 'slider', title: 'Mix any sounds together', body: 'Eight loops, each at its own level.' },
    { icon: 'timer', title: 'A timer that fades out', body: 'Falls silent on its own once you are asleep.' },
    { icon: 'bookmark', title: 'Save the mixes that work', body: 'One tap to start the same night again.' },
    { icon: 'bed', title: 'A simple sleep log', body: 'How long you listened, how the night went.' },
  ] satisfies Benefit[],
  plans: [
    {
      id: 'yearly',
      packageId: '$rc_annual',
      title: 'Yearly',
      period: 'year',
      weeks: 52,
      mockPrice: '$39.99',
      trialDays: 7,
      badge: 'Best value',
    },
    {
      id: 'weekly',
      packageId: '$rc_weekly',
      title: 'Weekly',
      period: 'week',
      weeks: 1,
      mockPrice: '$4.99',
    },
  ] satisfies PlanConfig[],
  defaultPlan: 'yearly' as PlanId,
  /** CTA when the selected plan has a trial; `{days}` is replaced. */
  trialCta: 'Start my {days}-day free trial',
  cta: 'Continue',
  footnote: 'Cancel anytime in your App Store settings. Payment is charged to your Apple ID.',
};
