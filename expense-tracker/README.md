# Tallyo — budget and expense tracker

Tallyo turns a monthly budget into one daily number. You log what you spend on an in-app keypad in
three taps, and the "left today" amount on the home screen drops with every entry. Budgets per
category, a monthly report, a hard paywall and onboarding that builds the user's plan are all in the
box. Everything is stored on the phone: no bank connection, no account, no backend.

It is for people who want to know what they can still spend this month without linking a bank.

## Why this niche

tracker at $39.99 undercuts them while looking premium. The daily number and the month runway give
control in the first minute with no bank connection, so the app is cheap to run and fast to approve.

| App | Monthly | Yearly | Trial | Source |
|---|---|---|---|---|
| Copilot | $18 | $109 | 1 month | [App Store](https://apps.apple.com/us/app/copilot-track-budget-money/id1447330651) |
| YNAB | $14.99 | $109 | 30 days | [App Store](https://apps.apple.com/us/app/ynab/id1010865877) |
| Monarch | $14.99 | $99.99 | 7 days | [Penny Hoarder](https://www.thepennyhoarder.com/budgeting/best-budgeting-apps/), [Kiplinger](https://www.kiplinger.com/personal-finance/how-to-save-money/best-budgeting-apps) |
| Rocket Money | free + $6–12 pay what you want | | | same |
| Buddy | $9.99 | $49.99 | | same |

Price pattern used by the template: a weekly plan and a yearly plan with a 7-day trial, yearly
pre-selected. Revenue signals: Copilot about $100K/month ([Adapty](https://adapty.io/paywall-library/copilot-track-budget-money/))
to $250–310K/month ([ScreensDesign](https://screensdesign.com/showcase/copilot-track-budget-money)).

## Features

- Onboarding: budget band, biggest spending category, payday. The last step builds the user's plan
  from the answers (monthly total, daily allowance, reset day, category budgets).
- Hard paywall with weekly and yearly plans (RevenueCat, with a built-in mock so it runs without keys).
  The custom paywall shows the plan the user just built, per-week prices, the saving on yearly and a
  trial timeline.
- Today: the daily allowance in a large serif numeral above the month runway (one column per day,
  filled with what that day cost, today outlined, a dashed daily-plan line), spending grouped by day.
- Add expense: form sheet with an in-app keypad, category strip, note and day. The allowance springs
  down on save.
- Budgets: a ring where each category owns an arc as long as its limit and fills it as it spends,
  then one grouped list with a meter per category; limits are edited on the same keypad.
- Report: six months of rounded bars against the budget line, breakdown by category, every expense
  of the selected month.
- Settings: monthly budget, reset day, currency, delete all expenses, theme (system, light, dark),
  restore, manage
  subscription, terms, privacy, rate, contact, version. In development: load sample data, reset app.
- Light and dark themes designed separately; DM Serif Display for money, DM Sans for text; SF
  Symbols on iOS.

Stack: Expo SDK 58, Expo Router, TypeScript, React Native StyleSheet, react-native-svg, Reanimated,
RevenueCat, expo-sqlite.

## Screens

| Screen | What it shows |
|---|---|
| Onboarding (5 steps) | Welcome, then budget, top category and payday questions with a live preview of the daily number, then "Your plan" built line by line |
| Paywall | The user's daily number on day one, four benefits, weekly and yearly plans with per-week price and saving, the trial timeline |
| Today | "Left today" numeral, month runway, spending by day, Add expense |
| Add / edit expense | Form sheet: amount on the in-app keypad, category strip, note, today or yesterday |
| Budgets | Category ring with the month's spend in the middle, one row per category |
| Category limit | Form sheet: the limit on the same keypad, spent so far |
| Report | Six months of bars against the budget line, breakdown by category, every expense of the month |
| Settings | Budget, reset day, currency, theme, subscription, legal, contact, version |

## Screenshots

Taken on the iPhone 17 Pro Max simulator during the visual QA pass, in the order of a first run.

| # | Screen | File |
|---|---|---|
| 01 | Onboarding: welcome | [`01-onboarding-welcome.png`](screenshots/01-onboarding-welcome.png) |
| 02 | Onboarding: monthly budget (the daily number previews it) | [`02-onboarding-budget.png`](screenshots/02-onboarding-budget.png) |
| 03 | Onboarding: where most of it goes | [`03-onboarding-category.png`](screenshots/03-onboarding-category.png) |
| 04 | Onboarding: when the money month starts | [`04-onboarding-reset.png`](screenshots/04-onboarding-reset.png) |
| 05 | Building the plan | [`05-onboarding-building.png`](screenshots/05-onboarding-building.png) |
| 06 | Your plan | [`06-onboarding-plan.png`](screenshots/06-onboarding-plan.png) |
| 07 | Paywall | [`07-paywall.png`](screenshots/07-paywall.png) |
| 08 | Paywall, dark | [`08-paywall-dark.png`](screenshots/08-paywall-dark.png) |
| 09 | Today on day one, mid-month (budget covers only the days left) | [`09-home-empty.png`](screenshots/09-home-empty.png) |
| 10 | Add expense sheet: keypad and category chips | [`10-add-expense.png`](screenshots/10-add-expense.png) |
| 11 | Today after the first expense | [`11-home-after-add.png`](screenshots/11-home-after-add.png) |
| 12 | Today with sample data | [`12-home.png`](screenshots/12-home.png) |
| 13 | Today, dark | [`13-home-dark.png`](screenshots/13-home-dark.png) |
| 14 | Budgets: the category ring and limits | [`14-budgets.png`](screenshots/14-budgets.png) |
| 15 | Budgets, dark | [`15-budgets-dark.png`](screenshots/15-budgets-dark.png) |
| 16 | Report: six months and categories | [`16-report.png`](screenshots/16-report.png) |
| 17 | Report, dark | [`17-report-dark.png`](screenshots/17-report-dark.png) |
| 18 | Settings | [`18-settings.png`](screenshots/18-settings.png) |
| 19 | Settings, dark | [`19-settings-dark.png`](screenshots/19-settings-dark.png) |

## Run it

You need a Mac with [Xcode](https://apps.apple.com/app/xcode/id497799835) and Node 22.

```bash
npm install
npx expo start
```

Press `i` to open the iOS simulator. Without a RevenueCat key the app uses the built-in paywall and
a mock purchase, so you can click through onboarding → paywall → tabs right away. In Settings there
is a "Load sample data" row (development only) that fills six months of expenses, and a "Reset app"
row to go back to the first launch.

The native libraries (SVG, Reanimated, SF Symbols) need a development build instead of Expo Go:

```bash
npx expo run:ios
```

## Connect RevenueCat

1. Create a project at [app.revenuecat.com](https://app.revenuecat.com) and add your iOS app
   (bundle id must match `ios.bundleIdentifier` in `app.json`).
2. In App Store Connect create two auto-renewable subscriptions (weekly and yearly) in one
   subscription group. Give the yearly one a 7-day free trial introductory offer. Add both products
   to RevenueCat.
3. In RevenueCat create an entitlement with the identifier `pro` and attach both products.
4. Create an offering and make it the **default**. Add two packages: **Weekly** (`$rc_weekly`)
   and **Annual** (`$rc_annual`) and attach the matching products.
5. Design a paywall for that offering in RevenueCat → Paywalls and publish it, or set
   `ui: 'custom'` in `src/config/paywall.ts` to keep the built-in paywall (it reads the real prices
   and trial from the products).
6. Copy the iOS public API key (starts with `appl_`) and put it in a `.env` file:

   ```bash
   cp .env.example .env
   # EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
   ```

7. Rebuild: `npx expo run:ios`. The purchases are now real (sandbox while testing).

## Rebrand

One command renames the app, slug, bundle id and brand color:

```bash
node scripts/rebrand.mjs --name "Pennywise" --slug pennywise --bundle com.yourname.pennywise --color "#1F6F5F"
```

Then replace the images in `assets/` (`icon.png` 1024×1024, `splash-icon.png`, and the three
Android icon layers) and edit `src/config/app.ts` (support email, terms and privacy URLs).

### Prompt for Claude Code or Cursor

Paste this into your AI coding agent, in the app folder, and fill in the angle brackets:

> Rebrand this expense tracker. Read README.md, AGENTS.md and DESIGN-NOTES.md first.
> 1. Run `node scripts/rebrand.mjs --name "<App Name>" --slug <app-slug> --bundle <com.company.app> --color "<#hex>"`.
> 2. In `src/config/onboarding.ts` rewrite the copy for `<my audience>` and keep the three question
>    ids (`budget`, `topCategory`, `payday`); their option ids map to amounts and days in
>    `src/features/expenses/budgetPlan.ts`, so change those two files together if you change options.
> 3. Rewrite `src/config/paywall.ts` (headline, subheadline, the four benefits). Keep the plan ids
>    and package ids.
> 4. Set the support email and legal URLs in `src/config/app.ts`.
> 5. Edit the categories (labels, icons, default shares) in `src/features/expenses/categories.ts`;
>    icons come from `src/components/Icon.tsx`.
> 6. Replace the five images in `assets/` with my logo. Keep `icon.png` opaque.
> 7. Finish with `npx tsc --noEmit`, `npx expo-doctor` and `npx expo export --platform ios`, all
>    clean. No TODOs, placeholder text or unused code.

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
  _layout.tsx             Root: loads fonts, hydrates state, decides onboarding → paywall → tabs
  paywall.tsx             RevenueCat paywall, or the built-in one without a key
  expense.tsx             Form sheet: add or edit an expense (?id=)
  budget.tsx              Form sheet: a category's monthly limit (?categoryId=)
  (onboarding)/           index (step 0) and [step] (1..n)
  (tabs)/                 index (Today), budgets, report, settings
src/
  components/             Screen (large title, gutters, pinned CTA), Stack and Row (gaps from the
                          8-pt grid), Button, Card, Chip, Keypad, Icon, ListRow, MeterBar,
                          SheetHeader, EmptyState, Text
  config/                 app.ts (email, links, entitlement), onboarding.ts, paywall.ts
  db/                     index.ts (open + migrate), migrations.ts, expenses.ts, budgets.ts
  features/
    expenses/             Today screen, add/edit sheet, hero, day runway, list, and the domain:
                          categories, money, period (budget month), preferences, budgetPlan, data hooks
    budgets/              Budgets screen, limit editor sheet, category ring
    report/               Report screen, six-month bar chart
    onboarding/           Onboarding screen, live plan preview, plan step
    paywall/              Built-in paywall
    settings/             Settings screen
  purchases/              getEntitlement / purchase / restore; RevenueCat or mock behind it
  state/appState.ts       Persisted store: onboardingDone, answers, entitled
  theme/theme.ts          Palette (light and dark), type scale, spacing, radii; useTheme()
scripts/rebrand.mjs       Rename app, slug, bundle id, brand color
assets/                   Icon, splash image, Android icon layers
DESIGN-NOTES.md           Palette, type scale, the signature interaction, critique rounds
```

## Checks and notes

```bash
npx tsc --noEmit                 # types
npx expo-doctor                  # dependencies and config
npx expo export --platform ios   # the app bundles
```

Notes:

- Data model: `expenses` (amount in cents, category, note, time) and `budgets` (one limit per
  category). A budget month runs from the reset day to the next; `periodContaining()` in
  `src/features/expenses/period.ts` is the only place that decides it.
- The onboarding answers are used, not just stored: the budget band seeds the category limits on
  first load, the top category gets 30% and is the default in the add sheet, and the payday answer is
  the reset day until Settings overrides it.
- `expo-notifications` is installed but not used, so an end-of-day reminder can be added without a
  new native dependency. `react-dom` is pinned only to satisfy Expo Router's dependency tree with
  npm; the app has no web target.
- Layout is built from tokens only: spacing from the 8-pt grid in `theme.spacing` (20 pt screen
  gutter), text from `theme.typography`, colors from the light and dark palettes. Keep it that way
  when you add screens and the app stays consistent.
- `supportsTablet` is `false`, so App Store Connect only asks for iPhone screenshots.

## Ideas for version two

Left out on purpose, per the research: bank sync (Plaid cost and review risk), shared budgets,
receipt scanning. Also worth considering: recurring expenses, an optional end-of-day reminder, CSV
export, and budgets that change month to month.
