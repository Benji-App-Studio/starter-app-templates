import RevenueCatUI from 'react-native-purchases-ui';

import { CustomPaywall } from '@/features/paywall/CustomPaywall';
import { applyCustomerInfo, showsRevenueCatPaywall } from '@/purchases';

/** Hard paywall: no close button. The root layout swaps it for the tabs once entitled. */
export default function PaywallRoute() {
  if (!showsRevenueCatPaywall) {
    return <CustomPaywall />;
  }

  return (
    <RevenueCatUI.Paywall
      onPurchaseCompleted={({ customerInfo }) => applyCustomerInfo(customerInfo)}
      onRestoreCompleted={({ customerInfo }) => applyCustomerInfo(customerInfo)}
    />
  );
}
