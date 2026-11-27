# Clearstreak

A quit tracker for people leaving a habit behind: smoking, vaping, drinking, or anything else they
name. It keeps a live counter of the time since they stopped, turns that time into money kept and
units not had, marks ten milestones from 12 hours to a year, and gives them a craving button that
walks them through a minute of slow breathing. A slip resets the counter after a deliberate hold and
keeps the run in history instead of wiping it. The tone is supportive and plain; there are no
health or medical claims anywhere in the copy.

## Why this niche

People paying to stop something convert on emotion and pay yearly or lifetime up front; the
$9.99 a month and $30–40 a year, with hard paywalls behind a short trial, and a one-person app can
match them because the whole product is a counter, a craving screen and a milestone list. The
template stays substance-agnostic (the same code counts cigarettes, puffs, drinks or "times") and
avoids medical content, which keeps App Store review simple.

| App | Prices (US App Store, Nov 27 2026) | Revenue signal |
|---|---|---|
| I Am Sober | $9.99/mo, $27.49/6 mo, $29.99–39.99/yr; 192K ratings [64] | ~$100K/mo (Adapty) [69]; $200–250K (ScreensDesign) [70] |
| Reframe (alcohol) | $13.99/mo, $79.99/yr, 7-day trial [65] | ~$250K/mo (ScreensDesign) [71] |
| Quitzilla | $5.99/wk, $5.99–7.99/mo, $29.99/yr, $89.99 lifetime, no trial [66] | $100K+/mo (AppGoblin) vs under $5K (ScreensDesign) [72] |
| QUITTR | $9.99–14.99/mo, $19.99–29.99/yr, $49.99 lifetime [67] | $16K–350K/mo (ScreensDesign, conflicting) [73] |
| Smoke Free Plan | $69.99/yr, 7-day trial [68] | smoking-cessation category average ~$116K/mo [74] |

Paywall patterns seen: QUITTR runs a hard paywall with a timed discount and then a 3-day trial;
I Am Sober asks 20 identity questions, then a soft paywall with a 7-day trial and the yearly plan
tagged as the saving [70][73]. Clearstreak keeps the hard paywall from the base and prices the mock
plans at $5.99 a week and $39.99 a year (the yearly card computes and shows the per-week price and
the saving).

Sources: [64] apps.apple.com/us/app/i-am-sober/id672904239 · [65] apps.apple.com/us/app/reframe-drink-less-thrive/id1485756576 ·
[66] apps.apple.com/us/app/quitzilla-quit-tracker/id1533076568 · [67] adapty.io/paywall-library/quittr/ ·
[68] apps.apple.com/app/id6771210594 · [69] adapty.io/paywall-library/i-am-sober/ · [70] screensdesign.com/showcase/i-am-sober ·
[71] screensdesign.com/apps/quitzilla-quit-tracker/ · [72] appgoblin.info/apps/com.despdev.quitzilla ·
[73] screensdesign.com/showcase/quittr-quit-porn-now · [74] screensdesign.com/categories/smoking-cessation-apps/

## Features

- **Onboarding** (five steps): what the habit is, how much on a typical day, what it cost per day,
  each with a live preview that reacts to the answer, then a "Your counter is set" step that builds
  the first-month plan from the answers.
- **Hard paywall** with the counter in its ready state, four benefit rows, weekly and yearly plans
  (yearly pre-selected, per-week price and "Save NN%" computed from the prices), RevenueCat behind it
  and a mock when no key is set.
- **Counter** tab: a ring that fills toward the next milestone, with the time free inside it rolled
  out digit by digit like an odometer; money kept, units not had and cravings beaten; the next
  milestone; a craving button and an "I slipped" link.
- **Craving** screen: name what set it off, breathe for a minute with a circle that grows and shrinks
  (4 s in, 4 s hold, 6 s out, four rounds), then log that it passed.
- **Slip** screen: the run's numbers, an optional note, and a hold-to-reset button; the old run goes
  to history and a new counter starts.
- **Milestones** tab: ten markers on a vertical line that fills as time passes, with reached dates
  and time to the next one.
- **History** tab: longest run, time free in all, money kept in all; cravings per day for the last
  week as a hand-drawn chart; every attempt with its note; recent cravings.
- **Settings**: habit, units per day and daily spend (steppers that also update the live counter),
  currency, delete counter data, plus the base rows (theme, subscription, legal, rate, contact,
  version) and, in development, "Load sample data" and "Reset app".
- Light and dark themes, Manrope throughout, SF Symbols on iOS, everything stored on the device in
  SQLite.

Stack: Expo SDK 58, Expo Router, TypeScript, React Native StyleSheet, Reanimated, Gesture Handler,
react-native-svg, RevenueCat, expo-sqlite.

## Screens

| Screen | What is on it |
|---|---|
| Onboarding (5 steps) | Progress bar, a live preview of the counter that reacts to each answer, large option rows, then "Your counter is set": the ring fills while the plan is built and shows the first month in money and units |
| Paywall | The ring in its ready state ("Day 1 starts now"), the daily saving from the answers, four benefits, weekly and yearly plans with the per-week price and "Save NN%" computed, Restore · Terms · Privacy |
| Counter | The ring with the odometer counter inside, three tiles (kept, not had, cravings beaten), the next milestone, the craving button and "I slipped" |
| Craving | Trigger picker, the one-minute breathing circle, "Still here. Still free." |
| Slip | This run's numbers, an optional note, hold to reset |
| Milestones | Ten markers on a vertical line that fills with the current run |
| History | Time free across every attempt, longest run, totals, the week's cravings chart, every attempt and recent cravings |
| Settings | Habit, amount, daily spend, currency, theme, subscription, legal, data |

Run the app with "Load sample data" (Settings, development builds only) to see every screen
populated; that is also the quickest way to take your App Store screenshots.

## Screenshots

Taken on the iPhone 17 Pro Max simulator during the visual QA pass, in the order of a first run.

| # | Screen | File |
|---|---|---|
| 01 | Onboarding: welcome with the counter ring | [`01-onboarding-welcome.png`](screenshots/01-onboarding-welcome.png) |
| 02 | Onboarding: what you are leaving behind | [`02-onboarding-habit.png`](screenshots/02-onboarding-habit.png) |
| 03 | Onboarding: how much on a typical day | [`03-onboarding-amount.png`](screenshots/03-onboarding-amount.png) |
| 04 | Onboarding: what it cost per day (money kept preview) | [`04-onboarding-cost.png`](screenshots/04-onboarding-cost.png) |
| 05 | Your counter is set | [`05-onboarding-plan.png`](screenshots/05-onboarding-plan.png) |
| 06 | Paywall | [`06-paywall.png`](screenshots/06-paywall.png) |
| 07 | Paywall, dark | [`07-paywall-dark.png`](screenshots/07-paywall-dark.png) |
| 08 | Counter before the start | [`08-counter-empty.png`](screenshots/08-counter-empty.png) |
| 09 | When did you stop? sheet | [`09-start-sheet.png`](screenshots/09-start-sheet.png) |
| 10 | Counter 12 days in (sample data): odometer, money, milestone | [`10-counter.png`](screenshots/10-counter.png) |
| 11 | Counter, dark | [`11-counter-dark.png`](screenshots/11-counter-dark.png) |
| 12 | Craving: what set it off | [`12-craving.png`](screenshots/12-craving.png) |
| 13 | Craving: the breathing circle | [`13-breathing.png`](screenshots/13-breathing.png) |
| 14 | Milestones timeline | [`14-milestones.png`](screenshots/14-milestones.png) |
| 15 | Milestones, dark | [`15-milestones-dark.png`](screenshots/15-milestones-dark.png) |
| 16 | History, nothing yet | [`16-history-empty.png`](screenshots/16-history-empty.png) |
| 17 | History: totals, cravings chart, attempts | [`17-history.png`](screenshots/17-history.png) |
| 18 | History, dark | [`18-history-dark.png`](screenshots/18-history-dark.png) |
| 19 | Settings | [`19-settings.png`](screenshots/19-settings.png) |
| 20 | Settings, dark | [`20-settings-dark.png`](screenshots/20-settings-dark.png) |

## Run it

You need a Mac with [Xcode](https://apps.apple.com/app/xcode/id497799835) and Node 22.

```bash
npm install
npx expo run:ios
```

The app uses native modules (Reanimated, Gesture Handler, SVG, SF Symbols, SQLite, RevenueCat), so
it runs in a development build, not Expo Go. Without a RevenueCat key the app uses the built-in
paywall and a mock purchase, so you can click through onboarding → paywall → tabs right away.
In Settings there is a "Load sample data" row (development only) that fills the app with two past
attempts, a current one and a week of cravings, and a "Reset app" row to go back to the first launch.

## Connect RevenueCat

1. Create a project at [app.revenuecat.com](https://app.revenuecat.com) and add your iOS app
   (bundle id must match `ios.bundleIdentifier` in `app.json`).
2. In App Store Connect create two auto-renewable subscriptions (weekly and yearly) in one
   subscription group. Add both products to RevenueCat.
3. In RevenueCat create an entitlement with the identifier `pro` and attach both products.
4. Create an offering and make it the **default**. Add two packages: **Weekly** (`$rc_weekly`)
   and **Annual** (`$rc_annual`) and attach the matching products.
5. Design a paywall for that offering in RevenueCat → Paywalls and publish it, or set
   `ui: 'custom'` in `src/config/paywall.ts` to keep the built-in paywall and still sell through
   RevenueCat.
6. Copy the iOS public API key (starts with `appl_`) and put it in a `.env` file:

   ```bash
   cp .env.example .env
   # EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
   ```

7. Rebuild: `npx expo run:ios`. Purchases are now real (sandbox while testing).

## Rebrand

One command renames the app, slug, bundle id and brand color:

```bash
node scripts/rebrand.mjs --name "Dayzero" --slug dayzero --bundle com.yourname.dayzero --color "#0F8A5F"
```

Then replace the images in `assets/` (`icon.png` 1024×1024, `splash-icon.png`, and the three
Android icon layers) and edit `src/config/app.ts` (support email, terms and privacy URLs). The
milestone gold (`ACCENT_COLOR`) and the dark palette live in `src/theme/theme.ts`.

### Prompt for Claude Code or Cursor

Paste this into your AI coding agent, in the app folder, and fill in the angle brackets:

> Rebrand this quit-tracker app as `<App Name>`. Read README.md and AGENTS.md first.
> 1. Run `node scripts/rebrand.mjs --name "<App Name>" --slug <app-slug> --bundle <com.company.app> --color "<#hex>"`.
> 2. In `src/features/quit/habits.ts`, adjust the habit presets to the audience: rename labels, units and "free" labels, add or remove a preset, and tune the default units per day for each amount answer. Keep the `Habit` type.
> 3. Rewrite the copy in `src/config/onboarding.ts` (keep the five steps and the question ids `habit`, `amount`, `spend`) and in `src/config/paywall.ts` (headline, subheadline, benefits). Keep the plan ids and package ids.
> 4. Set the support email and legal URLs in `src/config/app.ts`.
> 5. If the milestones should read differently for this audience, edit the titles and bodies in `src/features/quit/milestones.ts`. Keep them about time and effort, never about health.
> 6. Replace the icon and splash in `assets/` with the new mark in the brand color.
> 7. Finish with `npx tsc --noEmit`, `npx expo-doctor` and `npx expo export --platform ios`, all clean. No TODOs, placeholder text or unused code.

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
   the same URL used inside the app. Keep the description free of health claims, as the app is.

## Folder map

```
app/                      Routes. Thin files that render a screen from src/features.
  _layout.tsx             Root: loads Manrope, hydrates state, decides onboarding → paywall → tabs
  paywall.tsx             RevenueCat paywall, or the built-in one without a key
  (onboarding)/           index (step 0) and [step] (1..4)
  (tabs)/                 index (Counter), milestones, history, settings
  craving.tsx, slip.tsx   Modals opened from the Counter tab
  start.tsx               Bottom sheet: when did you stop?
  habit.tsx, currency.tsx Bottom sheets opened from Settings
src/
  components/             Layout: Screen (safe areas, 20 pt gutter, collapsing title, pinned
                          footer), Stack, Row, Section, BottomCTA, Card. Controls: Button,
                          ChoiceRow, Stepper, ProgressBar, ListRow, EmptyState, Icon (SF Symbols →
                          Ionicons), Text
  config/                 app.ts (email, links, entitlement), onboarding.ts, paywall.ts
  db/                     index.ts (open + migrate), migrations.ts, attempts.ts, cravings.ts
  features/
    quit/                 The core feature: habits.ts (presets), profile.ts (rates, currency),
                          time.ts, savings.ts, milestones.ts, the screens, the ring, the odometer,
                          the breathing circle, the timeline, the chart, sampleData.ts
    onboarding/           OnboardingScreen, StepVisual (live previews), PlanStep
    paywall/              CustomPaywall
    settings/             SettingsScreen, HabitSheet, CurrencySheet, PickerSheet
  purchases/              getEntitlement / purchase / restore; RevenueCat or mock behind it
  state/appState.ts       Persisted store: onboardingDone, answers, entitled
  theme/theme.ts          Palette (light and dark), spacing, radii, Manrope type scale; useTheme()
scripts/rebrand.mjs       Rename app, slug, bundle id, brand color
assets/                   Icon, splash image, Android icon layers
DESIGN-NOTES.md           Palette, type scale, how the signature interactions are built
```

Tables: `attempts` (one row per run: started_at, ended_at, the units-per-day and cost-per-day
snapshot, the slip note) and `cravings` (attempt_id, created_at, trigger, breathing_seconds).
The habit preset, the current rates and the currency are settings, kept in AsyncStorage by
`src/features/quit/profile.ts` and copied onto each attempt when it starts, so past runs keep
their own numbers.

## Checks and notes

```bash
npx tsc --noEmit                 # types
npx expo-doctor                  # dependencies and config
npx expo export --platform ios   # the app bundles
```

- Reminders are not part of version one; `expo-notifications` is installed but unused, as in the
  base, so a daily check-in reminder can be added without a new native dependency.
- `react-dom` is pinned only to satisfy Expo Router's dependency tree with npm; the app has no web
  target. `supportsTablet` is `false`, so App Store Connect only asks for iPhone screenshots.
- Reduce Motion is respected: the odometer, the ring and the breathing circle set their values
  directly instead of animating when it is on.

## Ideas for version two


- A daily check-in reminder and a milestone notification (the native module is already in).
- A journal: a short note per day next to the cravings.
- Several habits at once, each with its own counter.
- A community feed or a buddy you share your counter with.
- A "dependency score" quiz result before the paywall, as the top apps do.
- Coaching content and medical guidance, which need a professional behind them.
