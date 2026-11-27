# BiteCount

A calorie counter for people who want one honest number a day. Onboarding turns two questions
(goal, how active a normal day is) into a daily calorie target. Every meal you log fills a ring;
protein, carbs and fat get rings of their own. A week strip, a two-week chart and a detail screen
for every day keep the picture honest. Everything is stored on the device.

## Why this niche

Food logging is the biggest money in consumer health right now: Cal AI reached about $40M in
annual revenue on photo logging and was bought by MyFitnessPal, the category leader (Latka, Mar
is gated behind the subscription, so a hard paywall is the norm rather than the exception. This
template ships the loop those apps are built on (target → log → ring → history) with manual entry
and a built-in food list, and leaves a clean hook for photo scanning in version two.

| App | Price (US App Store, Nov 27 2026) | Note | Source |
|---|---|---|---|
| Cal AI | $9.99–29.99 IAPs, 3-day trial to yearly | #10 Top Free Health & Fitness; scanning needs a subscription | [apps.apple.com](https://apps.apple.com/us/app/cal-ai-calorie-tracker/id6480417616), [screensdesign.com](https://screensdesign.com/showcase/cal-ai-calorie-tracker) |
| MyFitnessPal | $19.99/mo, $79.99/yr | #20 Top Free | [apps.apple.com](https://apps.apple.com/us/app/myfitnesspal-calorie-counter/id341232718) |
| Lose It! | $39.99/yr, $59.99 lifetime | #91 Top Free | [apps.apple.com](https://apps.apple.com/us/app/id297368629) |
| Yazio | $11.90/mo, $23.90–47.90 per 12 months | No trial | [apps.apple.com](https://apps.apple.com/us/app/yazio-ai-calorie-tracker/id946099227) |

Benchmarks: Health & Fitness median $9.99/mo and about $39.94/yr; hard paywalls convert 10.7% of
downloads to paid by day 35 vs 2.1% freemium ([RevenueCat 2026](https://www.revenuecat.com/state-of-subscription-apps-2026/)).
The mock plans follow that pattern: $5.99 a week, $39.99 a year with a 3-day trial.

## Screens

- **Onboarding** (4 steps): welcome with the live ring, goal, activity, then "Your daily target is
  ready" after a short building moment, with the sum it came from (calories burned on a day like
  yours, the goal adjustment, the target) and the protein / carbs / fat split. The ring previews
  the target as each answer is picked.
- **Paywall**: the ring in its finished state with the personal target, four benefits, weekly and
  yearly plans (yearly pre-selected, per-week price and savings computed from the prices), a trial
  timeline when the store offers a trial, one CTA. Hard paywall, no close button.
- **Today**: week strip with a tiny ring per day, the calories-left ring with three macro rings,
  macro legend, meals grouped by breakfast / lunch / dinner / snacks (swipe a row to delete).
- **Log food** (form sheet): meal picker, search in the built-in list of about 55 foods, servings
  stepper with live totals, or enter name, calories and grams by hand.
- **History**: a two-week bar chart against the target line (today in the accent, over-target days
  in red), average / days logged / days on target, and a list of every logged day.
- **Day**: any past day in full, with its own rings, editable like today.
- **Settings**: daily target stepper (with a way back to the suggested target), macro split, theme,
  subscription, legal, rate, contact, version, delete all food logs. In development: load sample
  data, reset app.


## Screenshots

Taken on the iPhone 17 Pro Max simulator during the visual QA pass, in the order of a first run.

| # | Screen | File |
|---|---|---|
| 01 | Onboarding: welcome with the live ring | [`01-onboarding-welcome.png`](screenshots/01-onboarding-welcome.png) |
| 02 | Onboarding: goal (ring previews the target) | [`02-onboarding-goal.png`](screenshots/02-onboarding-goal.png) |
| 03 | Onboarding: how active a normal day is | [`03-onboarding-activity.png`](screenshots/03-onboarding-activity.png) |
| 04 | Building the plan (the real sum, 1.3 s) | [`04-onboarding-building.png`](screenshots/04-onboarding-building.png) |
| 05 | Your daily target, with the sum and the macro split | [`05-onboarding-plan.png`](screenshots/05-onboarding-plan.png) |
| 06 | Paywall | [`06-paywall.png`](screenshots/06-paywall.png) |
| 07 | Paywall, dark | [`07-paywall-dark.png`](screenshots/07-paywall-dark.png) |
| 08 | Today, nothing logged yet | [`08-today-empty.png`](screenshots/08-today-empty.png) |
| 09 | Log food sheet: meal picker and food list | [`09-log-food.png`](screenshots/09-log-food.png) |
| 10 | Log food: servings with live totals | [`10-log-serving.png`](screenshots/10-log-serving.png) |
| 11 | Today after the first log | [`11-today-first-log.png`](screenshots/11-today-first-log.png) |
| 12 | Today with sample data | [`12-today.png`](screenshots/12-today.png) |
| 13 | Today, dark | [`13-today-dark.png`](screenshots/13-today-dark.png) |
| 14 | Today scrolled: meals by group | [`14-today-meals.png`](screenshots/14-today-meals.png) |
| 15 | History: two-week chart and days | [`15-history.png`](screenshots/15-history.png) |
| 16 | History, dark | [`16-history-dark.png`](screenshots/16-history-dark.png) |
| 17 | Day detail (over target), dark | [`17-day-detail-dark.png`](screenshots/17-day-detail-dark.png) |
| 18 | Settings | [`18-settings.png`](screenshots/18-settings.png) |
| 19 | Settings, dark | [`19-settings-dark.png`](screenshots/19-settings-dark.png) |

## Run it

You need a Mac with [Xcode](https://apps.apple.com/app/xcode/id497799835) and Node 22.

```bash
npm install
npx expo start
```

The app uses native modules (SQLite, SVG, Reanimated, SF Symbols, RevenueCat), so it runs in a
development build rather than Expo Go:

```bash
npx expo run:ios
```

Without a RevenueCat key the app uses the built-in paywall and a mock purchase, so you can click
through onboarding → paywall → tabs right away. In Settings there is a "Load sample data" row
(development only) that fills twelve days of meals for screenshots, and "Reset app" to go back to
the first launch.

## Connect RevenueCat

1. Create a project at [app.revenuecat.com](https://app.revenuecat.com) and add your iOS app
   (bundle id must match `ios.bundleIdentifier` in `app.json`).
2. In App Store Connect create two auto-renewable subscriptions (weekly and yearly) in one
   subscription group. Give the yearly one a 3-day free trial introductory offer if you want the
   trial timeline on the paywall. Add both products to RevenueCat.
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

7. Rebuild: `npx expo run:ios`. Purchases are real now (sandbox while testing).

## Rebrand

One command renames the app, slug, bundle id and accent color:

```bash
node scripts/rebrand.mjs --name "Plate Count" --slug plate-count --bundle com.yourname.platecount --color "#E0532F"
```

Then replace the images in `assets/` (`icon.png` 1024×1024, `splash-icon.png`, and the three
Android icon layers) and edit `src/config/app.ts` (support email, terms and privacy URLs).

### Prompt for Claude Code or Cursor

Paste this into your AI coding agent, in the app folder, and fill in the angle brackets:

> Rebrand this calorie counter. Read README.md, AGENTS.md and DESIGN-NOTES.md first.
> 1. Run `node scripts/rebrand.mjs --name "<App Name>" --slug <app-slug> --bundle <com.company.app> --color "<#hex>"`.
> 2. In `src/config/onboarding.ts` rewrite the copy for `<audience>` (keep the question ids `goal` and `activity` and their option ids, because `src/features/diary/target.ts` reads them; or change both together).
> 3. In `src/config/paywall.ts` rewrite the headline, subheadline and four benefits for `<audience>`. Keep the plan ids and package ids.
> 4. Set the support email and legal URLs in `src/config/app.ts`.
> 5. Edit the built-in food list in `src/features/diary/foods.ts` for `<cuisine or diet>`, keeping the same shape.
> 6. Replace the icon and splash in `assets/` with `<your glyph>` in the accent color.
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
   the same URL used inside the app.

## Folder map

```
app/                      Routes. Thin files that render a screen from src/features.
  _layout.tsx             Root: loads the font, hydrates state, onboarding → paywall → tabs
  paywall.tsx             RevenueCat paywall, or the built-in one without a key
  log.tsx                 The log-food form sheet (?day=&meal=)
  day/[date].tsx          One day in detail
  (onboarding)/           index (step 0) and [step] (1..3)
  (tabs)/                 Today, History, Settings
src/
  components/             Layout: Screen (safe areas, 20 pt gutter, collapsing title, pinned
                          footer), Stack and Row (token gaps), Section, Card. Controls: Button,
                          ListRow, Icon (SF Symbols), Stepper, TextField, ScreenHeader,
                          AnimatedNumber, EmptyState, Text
  config/                 app.ts (email, links, entitlement), onboarding.ts, paywall.ts
  db/                     index.ts (open + migrate), migrations.ts, foodLogs.ts (the one table)
  features/
    diary/                Today, Day, Log food, the ring, week strip, meal list, food list,
                          target math, scan hook, sample data
    history/              History screen and the SVG bar chart
    onboarding/           Onboarding steps and the plan reveal
    paywall/              The built-in paywall
    settings/             Settings
  purchases/              getEntitlement / purchase / restore; RevenueCat or mock behind it
  state/appState.ts       Persisted store: onboardingDone, answers, entitled, calorieTarget
  theme/theme.ts          Palette (light and dark), spacing, radii, type scale; useTheme()
scripts/rebrand.mjs       Rename app, slug, bundle id, accent color
assets/                   Icon, splash image, Android icon layers
DESIGN-NOTES.md           Palette, type scale, layout rules, the signature interaction, review notes
```

## Checks and notes

```bash
npx tsc --noEmit                 # types
npx expo-doctor                  # dependencies and config
npx expo export --platform ios   # the app bundles
```

- The daily target comes from `suggestedTarget()` in `src/features/diary/target.ts`: a typical
  maintenance figure per activity level (1,800 / 2,000 / 2,300 / 2,600 kcal) plus the goal
  adjustment (−500 / 0 / +300), rounded to 50 and kept between 1,200 and 5,000. The user can
  override it in Settings; the override lives in `appState.calorieTarget`.
- Macro targets are a 30 / 40 / 30 split of protein, carbs and fat (4, 4 and 9 kcal per gram).
- One table, `food_logs`, keyed by a local `YYYY-MM-DD` day so a late snack stays on its day.
- `src/features/diary/scan.ts` is the photo-logging hook: set `foodScanner` to an object with
  `label` and `scan()` and the log sheet grows a scan button that pre-fills the by-hand form.
- `expo-notifications` is installed but not used (calorie logging does not need reminders), so a
  reminder feature can be added without a new native dependency. `react-dom` is pinned only to
  satisfy Expo Router's dependency tree with npm; the app has no web target.
- `supportsTablet` is `false`, so App Store Connect only asks for iPhone screenshots.

## Ideas for version two

From the research's "leave out of version one" list: photo scanning through the `foodScanner`
hook (a vision API behind the hard paywall), a barcode database, recipes, a weight log alongside
the calorie history, a longer onboarding quiz (age, height, weight, pace) for a Mifflin-St Jeor
target, wearable sync, community, and a coach chat.
