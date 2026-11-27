# Template contract

Every niche template in this repo is a fork of `base/`. These rules keep the ten templates
identical where it does not matter and different only where the niche lives, so one set of
docs, one rebrand prompt and one review checklist cover all of them.

## 1. Making a template

```bash
cp -R base <niche>            # e.g. habit-tracker
cd <niche>
rm -rf node_modules ios android   # generated folders never travel with a template
node scripts/rebrand.mjs --name "<App Name>" --slug <niche> --bundle com.example.<niche-no-dashes> --color "#RRGGBB"
npm install
```

The bundle id stays under `com.example.` in the repo; the buyer runs the rebrand script again
with their own name and bundle id.

## 2. Folder layout (fixed)

```
app/                 routes only; thin files that render a component from src/features
src/components/      shared building blocks; add to them, do not fork them per screen
src/config/          everything a non-coder edits: app.ts, onboarding.ts, paywall.ts
src/db/              index.ts, migrations.ts, one file per table
src/features/        one folder per feature; the niche's core feature lives here
src/purchases/       the only module that talks to RevenueCat
src/state/           appState.ts
src/theme/           theme.ts (the only place colors, spacing, radii, type styles are defined)
scripts/rebrand.mjs
assets/
```

Do not add top-level folders. Do not move files between these folders.

## 3. What a niche may change

- `src/features/home/` — replace entirely with the core feature. Add more feature folders
  under `src/features/` if the niche needs several screens.
- `app/(tabs)/` — add tabs for the niche's screens. Keep `index` (Home) and `settings`.
  Three to four tabs at most.
- `src/config/onboarding.ts`, `src/config/paywall.ts`, `src/config/app.ts` — rewrite the
  copy and options. Keep the types.
- `src/db/migrations.ts` — append migrations. `src/db/` — add one file per table following
  `entries.ts`. Delete `entries.ts` and its migration only if the niche does not use it and
  nothing imports it (rewrite migration 1 rather than leaving an unused table).
- `src/components/` — add components the niche needs if they are reusable. Style them from
  `useTheme()` only.
- `src/theme/theme.ts` — change `PRIMARY_COLOR` (via the script). Other values stay unless
  the niche has a reason (e.g. a reading app wants a serif body font).
- `assets/` — icon, splash image, Android icon layers, onboarding illustrations.
- `app.json` — only through the rebrand script, plus plugins the niche genuinely needs
  (e.g. `expo-notifications` config for reminders).
- README.md — update the first paragraph, the feature list and the folder map for the niche.

## 4. What must stay

- The root routing in `app/_layout.tsx`: first launch → onboarding; onboarding done →
  paywall until entitled → tabs. Protected routes decide; screens never navigate to the
  paywall or the tabs themselves, they change `appState`.
- The paywall is hard: no close button, no "continue free" link, no skip in development
  that could ship. The mock purchase exists only when no RevenueCat key is set.
- `src/purchases/` API: `configurePurchases()`, `getEntitlement()`, `getPlans()`,
  `purchase(planId)`, `restore()`, `getManagementUrl()`. Screens import from
  `@/purchases` only; never from `react-native-purchases` directly (the paywall route is
  the one exception for `RevenueCatUI.Paywall`).
- Entitlement id `pro`, default offering, package ids `$rc_weekly` and `$rc_annual`.
  Plan ids stay `weekly` and `yearly`.
- `src/state/appState.ts` shape: `hydrated`, `onboardingDone`, `onboardingAnswers`,
  `entitled`. Add fields if the niche needs app-wide flags; never store feature data here
  (that goes in SQLite).
- Settings rows: Theme, Status, Restore purchases, Manage subscription, Terms, Privacy,
  Rate the app, Contact us, Version. Add rows; do not remove these.
- Stack: Expo SDK as in base, Expo Router, StyleSheet (no Tailwind, no UI kit), AsyncStorage
  for settings, expo-sqlite for data, RevenueCat for billing. No backend, no auth, no
  analytics SDK, no ads.
- Path alias `@/` → `src/`. Imports from `app/` into `src/` only; `src/` never imports `app/`.

## 5. Onboarding config shape

```ts
type OnboardingStep = {
  id: string;
  title: string;
  body: string;
  icon: IconName;                 // Ionicons name, used when image is absent
  image?: ImageSourcePropType;    // optional illustration
  question?: {
    id: string;                   // key in appState.onboardingAnswers
    options: { id: string; label: string }[];
  };
};
```

Exactly 4 steps: welcome, question, question, closing. The last step's button says
"Get started" and sets `onboardingDone`. Read answers with
`useAppState().onboardingAnswers[questionId]` to personalise the feature.

## 6. Paywall behaviour

- Shown whenever `onboardingDone && !entitled`. Nothing else in the app shows a paywall.
- With `EXPO_PUBLIC_REVENUECAT_IOS_KEY` set and `paywallConfig.ui === 'revenuecat'`, the
  screen renders `RevenueCatUI.Paywall`. Otherwise it renders `CustomPaywall`.
- `CustomPaywall` shows: headline, subheadline, 4 benefits, two plan cards (yearly selected,
  "Best value" badge), the CTA, the footnote, Restore purchases, Terms, Privacy.
- Purchase and restore outcomes update `appState.entitled`; the root layout does the rest.
- User cancellation is silent; errors show an `Alert` with plain wording.

## 7. Naming

- Files: components `PascalCase.tsx`, everything else `camelCase.ts`. Route files follow
  Expo Router (`_layout.tsx`, `index.tsx`, `[param].tsx`, `(group)/`).
- Database: tables and columns `snake_case`; TypeScript row types `camelCase` with a `toX`
  mapper, as in `entries.ts`.
- App name in `app.json` is the display name ("Habit Pal"); slug and package name are the
  dashed form (`habit-pal`); scheme and bundle id have no dashes.
- No `utils/` or `helpers/` grab bags. A function lives next to the feature that uses it,
  or in `src/components/` / `src/db/` if shared.

## 8. Code quality bar

- TypeScript strict. No `any`, no `@ts-ignore`, no non-null assertions to silence errors.
- No TODO/FIXME comments, no lorem ipsum, no commented-out code, no console.log.
- No unused files, exports, dependencies or assets. Delete what the niche does not use.
- Every screen uses `Screen` and `useTheme()`. No hard-coded colors, sizes from `spacing`
  and `radii`.
- Copy is written for the buyer's user: short, plain, no marketing superlatives.
- Comments explain a decision, not what the code does.

## 9. README sections (in this order)

1. Title + one paragraph: what the app does, who it is for
2. Feature list
3. Run it
4. Connect RevenueCat
5. Rebrand (script + the agent prompt, adapted to the niche)
6. Ship it
7. Folder map
8. Checks and notes

## 10. Definition of done

From the template folder, all of these pass:

```bash
rm -rf node_modules && npm install   # clean install works
npx tsc --noEmit                     # no errors
npx expo-doctor                      # no failed checks
npx expo export --platform ios       # completes
```

Plus, by reading:

- Every dependency in `package.json` is imported somewhere (except `react-dom`, `expo-font`
  and `expo-linking`, which are peer requirements of Expo Router and vector icons).
- `expo-notifications` is either used or still present and unused as in base (it stays so
  the native module is ready for reminders). Do not add other unused native modules.
- README is complete per section 9 and mentions nothing that is not in the code.
- Running the app in the simulator from a fresh install walks onboarding → paywall → mock
  purchase → tabs, and "Reset app" in Settings brings it back to onboarding.
