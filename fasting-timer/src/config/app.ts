import Constants from 'expo-constants';

/** App-wide settings a niche template edits. The display name lives in app.json. */
export const appConfig = {
  name: Constants.expoConfig?.name ?? 'Lean Hours',
  version: Constants.expoConfig?.version ?? '1.0.0',
  supportEmail: 'support@example.com',
  termsUrl: 'https://example.com/terms',
  privacyUrl: 'https://example.com/privacy',
  /** RevenueCat entitlement identifier that unlocks the app. */
  entitlementId: 'pro',
};
