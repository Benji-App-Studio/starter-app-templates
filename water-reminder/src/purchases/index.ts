import { Platform } from 'react-native';

import { paywallConfig, type PlanId } from '@/config/paywall';
import { appState } from '@/state/appState';

import { mockProvider } from './mock';
import { createRevenueCatProvider } from './revenuecat';
import type { Plan, PurchasesProvider } from './types';

export type { Plan } from './types';
export { applyCustomerInfo } from './revenuecat';

const revenueCatKey = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

/** True when the paywall screen should render the paywall designed in the RevenueCat dashboard. */
export const showsRevenueCatPaywall = Boolean(revenueCatKey) && paywallConfig.ui === 'revenuecat';

const provider: PurchasesProvider = revenueCatKey
  ? createRevenueCatProvider(revenueCatKey)
  : mockProvider;

/** Call once at launch, before any other purchases function. */
export function configurePurchases() {
  provider.configure();
}

/** Ask the store whether the user is entitled, and remember the answer in the app state. */
export async function getEntitlement(): Promise<boolean> {
  const entitled = await provider.getEntitlement();
  appState.set({ entitled });
  return entitled;
}

export function getPlans(): Promise<Plan[]> {
  return provider.getPlans();
}

export function purchase(planId: PlanId): Promise<boolean> {
  return provider.purchase(planId);
}

export function restore(): Promise<boolean> {
  return provider.restore();
}

export function getManagementUrl(): Promise<string | null> {
  return provider.getManagementUrl();
}
