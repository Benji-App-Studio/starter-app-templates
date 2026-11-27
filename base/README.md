# Starter App

A complete iOS app shell you rename and fill with your own feature. It already has:

- Onboarding (4 screens, driven by one config file, answers saved on the device)
- A hard paywall with weekly and yearly plans (RevenueCat, with a built-in mock so it runs without any keys)
- Home and Settings tabs (restore purchases, manage subscription, terms, privacy, rate, contact, version)
- Light and dark theme from one file
- A local SQLite database with migrations
- A one-command rebrand script

Stack: Expo SDK 58, Expo Router, TypeScript, React Native StyleSheet, RevenueCat, expo-sqlite.

## Run it

You need a Mac with [Xcode](https://apps.apple.com/app/xcode/id497799835) and Node 22.

```bash
npm install
npx expo start
```

Press `i` to open the iOS simulator. Without a RevenueCat key the app uses the built-in
paywall and a mock purchase, so you can click through onboarding → paywall → tabs right away.
In Settings there is a "Reset app" row (development only) to go back to the first launch.

To run the real RevenueCat SDK you need a development build instead of Expo Go:

```bash
npx expo run:ios
```

## Connect RevenueCat

1. Create a project at [app.revenuecat.com](https://app.revenuecat.com) and add your iOS app
   (bundle id must match `ios.bundleIdentifier` in `app.json`).
2. In App Store Connect create two auto-renewable subscriptions (weekly and yearly) in one
   subscription group. Add both products to RevenueCat.
3. In RevenueCat create an entitlement with the identifier `pro` and attach both products.
4. Create an offering and make it the **default**. Add two packages: **Weekly** (`$rc_weekly`)
   and **Annual** (`$rc_annual`) and attach the matching products.
5. Design a paywall for that offering in RevenueCat → Paywalls and publish it.
6. Copy the iOS public API key (starts with `appl_`) and put it in a `.env` file:

   ```bash
   cp .env.example .env
   # EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
   ```

7. Rebuild: `npx expo run:ios`. The paywall screen now shows your RevenueCat paywall and the
   purchases are real (sandbox while testing).

Prefer your own paywall design? Set `ui: 'custom'` in `src/config/paywall.ts` to keep the
built-in paywall and still sell through RevenueCat.

## Rebrand

One command renames the app, slug, bundle id and brand color:

```bash
node scripts/rebrand.mjs --name "Habit Pal" --slug habit-pal --bundle com.yourname.habitpal --color "#0EA5E9"
```

Then replace the images in `assets/` (`icon.png` 1024×1024, `splash-icon.png`, and the three
Android icon layers) and edit `src/config/app.ts` (support email, terms and privacy URLs).

### Prompt for Claude Code or Cursor

Paste this into your AI coding agent, in the app folder, and fill in the angle brackets:

> Rebrand this app for `<niche>`. Read README.md and AGENTS.md first.
> 1. Run `node scripts/rebrand.mjs --name "<App Name>" --slug <app-slug> --bundle <com.company.app> --color "<#hex>"`.
> 2. Rewrite `src/config/onboarding.ts` with 4 steps for `<niche>` users: a welcome, two single-choice questions that matter to them, and a closing step. Keep the same shape.
> 3. Rewrite the copy in `src/config/paywall.ts` (headline, subheadline, 4 benefits) for `<niche>`. Keep the plan ids and package ids.
> 4. Set the support email and legal URLs in `src/config/app.ts`.
> 5. Replace `src/features/home/HomeScreen.tsx` with the core feature: `<describe the one thing the app does>`. Store its data with a new table in `src/db/` following `entries.ts` and append a migration in `src/db/migrations.ts`. Use the components in `src/components/` and `useTheme()`; no hard-coded colors.
> 6. Finish with `npx tsc --noEmit`, `npx expo-doctor` and `npx expo export --platform ios`, all clean. No TODOs, placeholder text or unused code.

## Ship it

1. Create an [Apple Developer](https://developer.apple.com/programs/) account ($99/year) and an
   [Expo](https://expo.dev) account.
2. Install EAS: `npm install -g eas-cli`, then `eas login` and `eas build:configure`.
3. Put your RevenueCat key in EAS so the production build has it:
   `eas env:create --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value appl_xxx --environment production`
4. Build: `eas build --platform ios --profile production`. EAS creates the certificates for you.
5. In [App Store Connect](https://appstoreconnect.apple.com) create the app with the same
   bundle id, fill in the listing (screenshots, description, privacy policy URL, the two
   subscriptions), then `eas submit --platform ios` uploads the build.
6. Test the paywall with a Sandbox tester account, then submit for review. Apple asks for a
   terms-of-use link in the app description for subscription apps; `src/config/app.ts` holds
   the same URL used inside the app.

## Folder map

```
app/                      Routes. Thin files that render a screen from src/features.
  _layout.tsx             Root: hydrates state, decides onboarding → paywall → tabs
  paywall.tsx             RevenueCat paywall, or the built-in one without a key
  (onboarding)/           index (step 0) and [step] (1..n)
  (tabs)/                 Home and Settings
src/
  components/             Screen, Button, Card, ListRow, ProgressDots, EmptyState, Text
  config/                 app.ts (email, links, entitlement), onboarding.ts, paywall.ts
  db/                     index.ts (open + migrate), migrations.ts, entries.ts (example table)
  features/               home, onboarding, paywall, settings screens
  purchases/              getEntitlement / purchase / restore; RevenueCat or mock behind it
  state/appState.ts       Persisted store: onboardingDone, answers, entitled
  theme/theme.ts          Colors, spacing, radii, typography; useTheme()
scripts/rebrand.mjs       Rename app, slug, bundle id, brand color
assets/                   Icon, splash image, Android icon layers
```

## Checks

```bash
npx tsc --noEmit                 # types
npx expo-doctor                  # dependencies and config
npx expo export --platform ios   # the app bundles
```

Notes:

- `expo-notifications` is installed but not used, so reminder features can be added without
  a new native dependency. `react-dom` is pinned only to satisfy Expo Router's dependency
  tree with npm; the app has no web target.
- `supportsTablet` is `false`, so App Store Connect only asks for iPhone screenshots.
