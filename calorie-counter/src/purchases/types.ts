import type { PlanId } from '@/config/paywall';

/** A purchasable plan as shown on the custom paywall. */
export type Plan = {
  id: PlanId;
  title: string;
  /** Localized price string, e.g. "$39.99". */
  price: string;
  period: string;
  /** Length of the free trial, when the store offers one. */
  trialDays?: number;
  badge?: string;
};

/** What a store backend must provide. Implemented by `revenuecat.ts` and `mock.ts`. */
export type PurchasesProvider = {
  configure(): void;
  /** True when the user is entitled to the app. */
  getEntitlement(): Promise<boolean>;
  getPlans(): Promise<Plan[]>;
  /** Resolves true when the purchase went through, false when the user cancelled. */
  purchase(planId: PlanId): Promise<boolean>;
  /** Resolves to the entitlement after restoring. */
  restore(): Promise<boolean>;
  /** Where the user manages the subscription, or null when unknown. */
  getManagementUrl(): Promise<string | null>;
};
