import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesPackage,
} from 'react-native-purchases';

import { appConfig } from '@/config/app';
import { paywallConfig, type PlanId } from '@/config/paywall';
import { appState } from '@/state/appState';

import type { Plan, PurchasesProvider } from './types';

export function isEntitled(info: CustomerInfo): boolean {
  return info.entitlements.active[appConfig.entitlementId] !== undefined;
}

/** Store the entitlement from a CustomerInfo so the root layout can route on it. */
export function applyCustomerInfo(info: CustomerInfo) {
  appState.set({ entitled: isEntitled(info) });
}

function isUserCancelled(error: unknown): boolean {
  return (error as PurchasesError | undefined)?.userCancelled === true;
}

async function findPackage(planId: PlanId): Promise<PurchasesPackage> {
  const plan = paywallConfig.plans.find((candidate) => candidate.id === planId);
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages.find(
    (candidate) => candidate.identifier === plan?.packageId,
  );
  if (!pkg) {
    throw new Error(`Package ${plan?.packageId ?? planId} is not in the current offering`);
  }
  return pkg;
}

export function createRevenueCatProvider(apiKey: string): PurchasesProvider {
  return {
    configure() {
      if (__DEV__) {
        void Purchases.setLogLevel(LOG_LEVEL.WARN);
      }
      Purchases.configure({ apiKey });
      Purchases.addCustomerInfoUpdateListener(applyCustomerInfo);
    },

    async getEntitlement() {
      const info = await Purchases.getCustomerInfo();
      applyCustomerInfo(info);
      return isEntitled(info);
    },

    async getPlans() {
      const offerings = await Purchases.getOfferings();
      const packages = offerings.current?.availablePackages ?? [];
      const plans: Plan[] = [];
      for (const plan of paywallConfig.plans) {
        const pkg = packages.find((candidate) => candidate.identifier === plan.packageId);
        if (pkg) {
          plans.push({
            id: plan.id,
            title: plan.title,
            price: pkg.product.priceString,
            period: plan.period,
            badge: plan.badge,
          });
        }
      }
      return plans;
    },

    async purchase(planId) {
      try {
        const pkg = await findPackage(planId);
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        applyCustomerInfo(customerInfo);
        return isEntitled(customerInfo);
      } catch (error) {
        if (isUserCancelled(error)) {
          return false;
        }
        throw error;
      }
    },

    async restore() {
      const info = await Purchases.restorePurchases();
      applyCustomerInfo(info);
      return isEntitled(info);
    },

    async getManagementUrl() {
      const info = await Purchases.getCustomerInfo();
      return info.managementURL;
    },
  };
}
