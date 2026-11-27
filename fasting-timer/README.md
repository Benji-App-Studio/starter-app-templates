# Lean Hours

An intermittent fasting timer for iPhone. Pick a plan (12:12, 14:10, 16:8, 18:6, 20:4 or one meal a
day), hold the ring to start a fast, watch the hours fill in, and end it when the marker turns gold.
Every fast is saved on the phone with streaks, hours per day and an alert the moment the goal is
reached. For people who want the timer and the ring without meal logging, courses or a community.

Stack: Expo SDK 58, Expo Router, TypeScript, React Native StyleSheet, RevenueCat, expo-sqlite,
react-native-svg, react-native-reanimated, react-native-gesture-handler, expo-symbols,
expo-notifications. Typeface: Sora.

## Why this niche

A mature niche whose incumbents still bill $70–90 a year for a timer and a ring, with no API cost, so
margins are the best among consumer health apps. The risk is AI calorie apps absorbing the search
volume; this app positions on simplicity and a quiet, dark-first screen. (Research in
`../research/NICHES.md`, section 4.)

| App | Price | Signal | Source |
|---|---|---|---|
| Zero | $9.99/mo, $69.99–89.99/yr, $149.99 lifetime; 445K ratings | about $100K/mo, under 1K downloads/mo (Adapty, Oct 2026); $150K (ScreensDesign) vs $10K+ (AppGoblin) | [32] [20] [36] |
| Fastic | $14.99/mo, $27.99/3 mo, $79.99 (likely yearly); 246K ratings | about $50K/mo, about 5K downloads/mo (Adapty, Oct 2026) | [33] [34] |
| Fasting App: Tracker & Timer | 60-step quiz, no trial, yearly highlighted, 60%-off second modal | about $45K/mo | [35] |
| Category | $420K/mo average, skewed by MyFitnessPal and Lose It | | [37] |

Sources: [20] adapty.io/paywall-library/zero-fasting-health-tracker · [32] apps.apple.com/us/app/zero-longevity-fasting/id1168348542 ·
[33] apps.apple.com/us/app/fastic-weight-loss-fasting/id1459260306, apppricinglab.com/iap/apple/1459260306 ·
[34] adapty.io/paywall-library/fastic · [35] screensdesign.com/showcase/fasting-app-tracker-timer ·
[36] screensdesign.com/apps/zero-fasting-health-tracker, appgoblin.info/apps/1168348542 · [37] screensdesign.com/categories/fasting-apps

The mock plans follow that pattern at the simple end: $4.99 a week, $39.99 a year (yearly pre-selected,
"Save NN%" computed from the two prices). Real prices come from RevenueCat.

## Features

- Onboarding (4 steps): welcome, fasting experience, usual last meal, then "Your plan" built from the
  two answers. The experience answer sets the starting plan; the last-meal answer sets the hour the
  fast starts, the eating window shown on the timer and the daily reminder time.
- Hard paywall with weekly and yearly plans (RevenueCat, with a built-in mock so it runs without keys).
  The custom paywall shows the ring in its finished state, personalized with the plan from onboarding.
- Timer tab: the ring with hour ticks, a glowing elapsed arc and a goal marker that turns gold. Hold
  the button to start (a short tap does nothing). Plan chips switch the plan, even mid-fast. Ending
  early asks first. "Edit start time" opens the fast sheet.
- History tab: current and longest streak, fasts completed, hours per day for the last seven days
  (drawn by hand, goal line included), every fast as a row. Tap a row to edit or delete it. "Log a
  past fast" for fasts done before the app.
- Reminders: an alert when the running fast reaches its goal, and a daily reminder at the usual
  start time. Both are off until turned on in Settings, which is where permission is asked.
- Settings: plan, reminders and start time, theme, subscription (status, restore, manage), terms,
  privacy, rate, contact, version, reset data. Development only: load sample data, reset app.
- Light and dark theme from one file. Dark is the designed-first palette.
- A local SQLite database (one table, `fasts`) with migrations.
- A one-command rebrand script.

## Screenshots

Taken on the iPhone 17 Pro Max simulator during the visual QA pass, in the order of a first run.

| # | Screen | File |
|---|---|---|
| 01 | Onboarding: welcome with the live ring (dark, the app's home mode) | [`01-onboarding-welcome.png`](screenshots/01-onboarding-welcome.png) |
| 02 | Onboarding: fasting experience (the ring previews the plan) | [`02-onboarding-experience.png`](screenshots/02-onboarding-experience.png) |
| 03 | Onboarding: last meal (the 24-hour strip) | [`03-onboarding-last-meal.png`](screenshots/03-onboarding-last-meal.png) |
| 04 | Your plan, ring turned gold | [`04-onboarding-plan.png`](screenshots/04-onboarding-plan.png) |
| 05 | Paywall | [`05-paywall.png`](screenshots/05-paywall.png) |
| 06 | Timer, ready to hold-start, dark | [`06-timer-ready-dark.png`](screenshots/06-timer-ready-dark.png) |
| 07 | Timer, ready, light | [`07-timer-ready.png`](screenshots/07-timer-ready.png) |
| 08 | A fast in hour 12, dark | [`08-timer-running-dark.png`](screenshots/08-timer-running-dark.png) |
| 09 | A fast in hour 12, light | [`09-timer-running.png`](screenshots/09-timer-running.png) |
| 10 | Edit start time sheet, dark | [`10-edit-start-dark.png`](screenshots/10-edit-start-dark.png) |
| 11 | Goal reached: the marker and arc turn gold | [`11-timer-goal-reached.png`](screenshots/11-timer-goal-reached.png) |
| 12 | Timer with sample data (streak pill) | [`12-timer.png`](screenshots/12-timer.png) |
| 13 | Timer with sample data, dark | [`13-timer-dark.png`](screenshots/13-timer-dark.png) |
| 14 | History: streaks, last 7 days, all fasts | [`14-history.png`](screenshots/14-history.png) |
| 15 | History, dark | [`15-history-dark.png`](screenshots/15-history-dark.png) |
| 16 | Settings | [`16-settings.png`](screenshots/16-settings.png) |
| 17 | Settings, dark | [`17-settings-dark.png`](screenshots/17-settings-dark.png) |

## Run it

You need a Mac with [Xcode](https://apps.apple.com/app/xcode/id497799835) and Node 22.

```bash
npm install
npx expo start
```

Press `i` to open the iOS simulator. Without a RevenueCat key the app uses the built-in paywall and a
mock purchase, so you can click through onboarding → paywall → tabs right away. In Settings there is
a "Reset app" row (development only) to go back to the first launch, and "Load sample data" to fill
History for screenshots.

This app uses native modules (reanimated, gesture handler, SVG, SF Symbols, notifications), so it
needs a development build rather than Expo Go:

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
5. Copy the iOS public API key (starts with `appl_`) and put it in a `.env` file:

   ```bash
   cp .env.example .env
   # EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
   ```

6. Rebuild: `npx expo run:ios`. The paywall still uses the built-in design (`ui: 'custom'` in
   `src/config/paywall.ts`) but the plans, prices and purchases are real (sandbox while testing).

Prefer a paywall designed in the RevenueCat dashboard? Publish one for the offering and set
`ui: 'revenuecat'` in `src/config/paywall.ts`.

## Rebrand

One command renames the app, slug, bundle id and brand color:

```bash
node scripts/rebrand.mjs --name "Window" --slug window-fasting --bundle com.yourname.window --color "#2F6FE0"
```

Then replace the images in `assets/` (`icon.png` 1024×1024, `splash-icon.png`, and the three
Android icon layers) and edit `src/config/app.ts` (support email, terms and privacy URLs). The
palette, type scale and spacing live in `src/theme/theme.ts`; the plans in
`src/features/fasting/protocols.ts`.

### Prompt for Claude Code or Cursor

Paste this into your AI coding agent, in the app folder, and fill in the angle brackets:

> Rebrand this fasting timer app. Read README.md, AGENTS.md and DESIGN-NOTES.md first.
> 1. Run `node scripts/rebrand.mjs --name "<App Name>" --slug <app-slug> --bundle <com.company.app> --color "<#hex>"`.
> 2. Rewrite the copy in `src/config/onboarding.ts` in the voice of `<brand>`. Keep the four steps, the question ids `experience` and `lastMeal`, and the option ids: the timer reads them.
> 3. Rewrite the headline, subheadline and the four benefits in `src/config/paywall.ts`. Keep the plan ids and package ids.
> 4. Set the support email and legal URLs in `src/config/app.ts`.
> 5. If the brand wants different plans, edit `src/features/fasting/protocols.ts` (id, name, fasting and eating hours, one-line note). Everything else reads from that list.
> 6. Replace the images in `assets/` with the brand's icon (1024×1024, no transparency) and splash glyph.
> 7. If you add or change a screen, build it from `Screen`, `Stack`, `Row`, `Section` and `Card` with spacing, colors and type from `src/theme/theme.ts` only; no raw numbers or hex values in components.
> 8. Finish with `npx tsc --noEmit`, `npx expo-doctor` and `npx expo export --platform ios`, all clean. No TODOs, placeholder text or unused code.

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
   the same URL used inside the app. The app makes no health claims; keep it that way in the listing.

## Folder map

```
app/                      Routes. Thin files that render a screen from src/features.
  _layout.tsx             Root: loads Sora, hydrates state, decides onboarding → paywall → tabs
  paywall.tsx             RevenueCat paywall, or the built-in one
  (onboarding)/           index (step 0) and [step] (1..3)
  (tabs)/                 index (Timer), history, settings
  fast/                   Form sheet: new (log a past fast) and [id] (edit a fast)
src/
  components/             Layout: Screen (safe areas, 20 pt gutter, pinned footer), Stack and Row
                          (token gaps), Section (title 12 pt above content). Parts: Button, Card,
                          ListRow, Icon, Stepper, ProgressBar, EmptyState, LargeTitle, Text
  config/                 app.ts (email, links, entitlement), onboarding.ts, paywall.ts
  db/                     index.ts (open + migrate), migrations.ts, fasts.ts
  features/fasting/       protocols, time, stats, preferences, notifications, actions, useFasting,
                          FastingRing (hero), HoldButton, ProtocolPicker, WeekChart, EmptyArt,
                          TimerScreen, HistoryScreen, FastEditorScreen, sampleData (dev only)
  features/onboarding/    OnboardingScreen + OnboardingVisual (live ring previews, plan build)
  features/paywall/       CustomPaywall
  features/settings/      SettingsScreen
  purchases/              getEntitlement / purchase / restore; RevenueCat or mock behind it
  state/appState.ts       Persisted store: onboardingDone, answers, entitled
  theme/theme.ts          Palette (light + dark), spacing, radii, type scale, fonts; useTheme()
scripts/rebrand.mjs       Rename app, slug, bundle id, brand color
assets/                   Icon, splash glyph, Android icon layers
DESIGN-NOTES.md           Palette, type scale, the hold-to-start interaction, layout rules, review
```

## Checks and notes

```bash
npx tsc --noEmit                 # types
npx expo-doctor                  # dependencies and config
npx expo export --platform ios   # the app bundles
```

Notes:

- Data model: one table, `fasts` (protocol id, goal hours snapshot, started at, ended at; a null
  `ended_at` is the running fast). Streaks count days on which a fast reached its goal and ended.
  The week chart counts a fast on the day it ended, plus the running fast on today.
- Preferences (plan, start time, reminder switches) live in AsyncStorage under
  `fasting-preferences/v1`; until the user changes one, its value comes from the onboarding answers.
- `expo-dev-client` is included so `npx expo start` opens the development build. `react-dom` is pinned
  only to satisfy Expo Router's dependency tree with npm; the app has no web target.
- `supportsTablet` is `false`, so App Store Connect only asks for iPhone screenshots.

### Ideas for version two

From the research's "leave out of version one": weight log with a target line, water tracking, meal
notes, a widget and Live Activity for the running fast, custom fasting hours, challenges and courses.
