import { paywallConfig, type PlanId } from '@/config/paywall';
import { appState } from '@/state/appState';

import type { PurchasesProvider } from './types';

const PURCHASE_DELAY_MS = 800;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Used when no RevenueCat key is set. Purchases succeed after a short delay
 * and the entitlement is kept in the persisted app state, so the whole app
 * can be developed and demoed without store products.
 */
export const mockProvider: PurchasesProvider = {
  configure() {},

  async getEntitlement() {
    return appState.get().entitled;
  },

  async getPlans() {
    return paywallConfig.plans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      price: plan.mockPrice,
      period: plan.period,
      badge: plan.badge,
    }));
  },

  async purchase(_planId: PlanId) {
    await wait(PURCHASE_DELAY_MS);
    appState.set({ entitled: true });
    return true;
  },

  async restore() {
    await wait(PURCHASE_DELAY_MS);
    return appState.get().entitled;
  },

  async getManagementUrl() {
    return null;
  },
};
