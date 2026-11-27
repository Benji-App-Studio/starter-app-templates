# Daily Dots

A habit tracker for people who want a handful of daily habits to stick. You pick the habits, hold
a tile to check one off (the ring fills, the phone ticks, it pops), and every habit grows a year
grid of dots. Streaks, perfect days and per-habit reminders are built in. Everything is stored on
the phone; there is no account.

Why this niche: it is the clearest indie success story on the App Store. One developer passed
$600K a year with a heatmap and widgets ([HabitKit][17]), a side project reached $1K MRR in eight
months at $29.99 a year ([Habit Pixel][19]), demand spikes every January and Black Friday, lifetime
still sells, and the build is small.

| App | Price (US App Store, Nov 27 2026) | Source |
|---|---|---|
| Streaks | $5.99 one-time, #1 Top Paid Health & Fitness | [13] |
| Habitify | $8.99/mo, $49.99/yr, $119.99 lifetime; Plus tier $29.99/yr, 7-day trial | [14] |
| Productive | $10.99/mo, $39.99–79.99/yr, $5.99 weekly with trial | [15] |
| HabitKit (solo dev) | $602K revenue in 2025, $28K MRR, 25,100 subscribers | [17], [18] |
| Habit Pixel (solo dev) | $4.99/mo, $29.99/yr; $840 MRR Dec 2025, past $1K Jan 2026 | [19] |
| LittleProgress | $3.2K MRR (RevenueCat-verified) | [21] |

The price pattern for the niche is $4.99/mo, $29.99/yr, lifetime $49.99–59.99, a 7-day trial,
yearly pre-selected. This template's mock plans show $2.99/week and $29.99/year with a 7-day
trial on the yearly plan (the template's contract fixes the two packages to weekly and annual).
Real prices come from your App Store Connect products through RevenueCat.

## Features

- **Today**: a segmented ring, one arc per habit due today, that fills as you check habits off; a
  grid of habit tiles; press-and-hold to complete (0.6 s ring fill with rising haptic ticks and a
  pop); perfect-day streak chip.
- **Progress**: perfect days in a row, completion per week drawn as rounded bars, 30-day rate,
  total check-ins, best streak, and a per-habit list with the last seven days as dots.
- **Habit detail**: current streak, best streak, 30-day rate, a GitHub-style year grid, hold to
  mark today done, schedule and reminder, delete.
- **Habit editor** (form sheet): name, icon (SF Symbols), repeat days with presets, reminder with
  a time stepper.
- **Onboarding** that sells: progress bar, a welcome grid that fills in day by day, a live preview
  of the starter habits for the chosen focus, a clock whose hands spring to the chosen check-in
  time, and a "Your plan" step that builds the first habits from the answers (each one tickable,
  with a ring that shows one segment per habit).
- **Paywall** (custom, hard): the ring in its success state, a headline and line personalised
  with the habit count and check-in time, four benefit rows, yearly pre-selected
  with per-week price and "Save NN%" computed from the plans, a trial timeline, a CTA that says
  what happens. RevenueCat Paywalls remain available when a key is set.
- **Reminders** with `expo-notifications`: per habit, on its days, at its time. Permission is
  asked from a Settings switch, never on first launch.
- **Settings**: reminders, check-in time, theme, subscription, legal, rate, contact, version,
  delete all habits; in development also "Load sample data" and "Reset app".
- Light and dark theme designed separately; Bricolage Grotesque + Figtree; tabular numerals.

Stack: Expo SDK 58, Expo Router, TypeScript, React Native StyleSheet, RevenueCat, expo-sqlite,
react-native-reanimated, react-native-gesture-handler, react-native-svg, expo-symbols.

### Onboarding answers and where they are used

| Question | Stored as | Used by |
|---|---|---|
| What do you want to work on first? | `onboardingAnswers.focus` | Picks the four starter habits (`src/features/habits/starters.ts`) shown on the plan step and on the empty Today screen |
| When will you check in? | `onboardingAnswers.checkin` | The default reminder time for new habits and for the starters, the paywall's personalised line; editable in Settings → Check-in time |

### Screens

The screenshots in `screenshots/` are in the order of a first run: onboarding (4), paywall (light,
dark), Today (fresh, one habit done, sample data, dark), Progress (light, dark), habit detail
(light, dark), Settings, habit editor (light, dark).

## Run it

You need a Mac with [Xcode](https://apps.apple.com/app/xcode/id497799835) and Node 22.

```bash
npm install
npx expo start
```

The app uses native modules (reanimated, gesture handler, SVG, SF Symbols, notifications), so it
runs in a development build rather than Expo Go:

```bash
npx expo run:ios
```

Without a RevenueCat key the app uses the built-in paywall and a mock purchase, so you can click
through onboarding → paywall → tabs right away. In Settings → Development there is "Load sample
data" (five habits with months of check-ins, for screenshots) and "Reset app" (back to the first
launch).

## Connect RevenueCat

1. Create a project at [app.revenuecat.com](https://app.revenuecat.com) and add your iOS app
   (bundle id must match `ios.bundleIdentifier` in `app.json`).
2. In App Store Connect create two auto-renewable subscriptions (weekly and yearly) in one
   subscription group. Give the yearly one a 7-day free trial introductory offer if you want the
   trial timeline on the paywall. Add both products to RevenueCat.
3. In RevenueCat create an entitlement with the identifier `pro` and attach both products.
4. Create an offering and make it the **default**. Add two packages: **Weekly** (`$rc_weekly`)
   and **Annual** (`$rc_annual`) and attach the matching products.
5. Either design a paywall for that offering in RevenueCat → Paywalls and publish it, or set
   `ui: 'custom'` in `src/config/paywall.ts` to keep the built-in paywall.
6. Copy the iOS public API key (starts with `appl_`) and put it in a `.env` file:

   ```bash
   cp .env.example .env
   # EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
   ```

7. Rebuild: `npx expo run:ios`. Purchases are now real (sandbox while testing).

## Rebrand

One command renames the app, slug, bundle id and brand color:

```bash
node scripts/rebrand.mjs --name "Tiny Wins" --slug tiny-wins --bundle com.yourname.tinywins --color "#0EA5E9"
```

The color also drives the dark-mode accent and the Android icon background. Then replace the
images in `assets/` (`icon.png` 1024×1024, `splash-icon.png`, and the three Android icon layers)
and edit `src/config/app.ts` (support email, terms and privacy URLs).

### Prompt for Claude Code or Cursor

Paste this into your AI coding agent, in the app folder, and fill in the angle brackets:

> Rebrand this habit tracker. Read README.md, AGENTS.md and DESIGN-NOTES.md first.
> 1. Run `node scripts/rebrand.mjs --name "<App Name>" --slug <app-slug> --bundle <com.company.app> --color "<#hex>"`.
> 2. Replace the five images in `assets/` with my logo (a flat mark, no text), keeping the sizes.
> 3. Rewrite the copy in `src/config/onboarding.ts` for `<who the app is for>`: keep the four steps and the two question ids (`focus`, `checkin`), change the option labels and, if needed, the starter habits per focus in `src/features/habits/starters.ts`.
> 4. Rewrite the headline, subheadline and four benefits in `src/config/paywall.ts`. Keep the plan ids and package ids.
> 5. Set the support email and legal URLs in `src/config/app.ts`.
> 6. If I want a different typeface, install it with `npx expo install @expo-google-fonts/<family>`, load it in `app/_layout.tsx` and change `fonts` in `src/theme/theme.ts`. Do not add other native modules.
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
  _layout.tsx             Root: loads fonts, hydrates state, decides onboarding → paywall → tabs
  paywall.tsx             RevenueCat paywall, or the built-in one without a key
  (onboarding)/           index (step 0) and [step] (1..3)
  (tabs)/                 index (Today), progress, settings
  habit/[id].tsx          Habit detail
  habit/edit.tsx          Add (no id) or edit (?id=) a habit, presented as a form sheet
src/
  components/             Screen, LargeTitleScreen, Button, IconButton, Card, ListRow, Icon,
                          Text, AnimatedNumber, ProgressBar, EmptyState, DotsMark, icons.ts
  config/                 app.ts (email, links, entitlement), onboarding.ts, paywall.ts
  db/                     index.ts (open + migrate), migrations.ts, habits.ts, completions.ts
  features/
    habits/               Today, Progress, detail and editor screens; HoldToComplete (the
                          signature interaction), TodayRing, YearGrid, WeeklyBars; dates.ts,
                          streaks.ts (all streak math), starters.ts (answers → first habits),
                          useHabitData.ts, sampleData.ts (development only)
    onboarding/           OnboardingScreen, StepVisual (live previews), PlanStep
    paywall/              CustomPaywall
    reminders/            expo-notifications scheduling, one weekly notification per habit day
    settings/             SettingsScreen
  purchases/              getEntitlement / purchase / restore; RevenueCat or mock behind it
  state/appState.ts       Persisted store: onboardingDone, answers, entitled, remindersEnabled
  theme/theme.ts          Palette (light and dark), fonts, type scale, spacing, radii; useTheme()
scripts/rebrand.mjs       Rename app, slug, bundle id, brand color
assets/                   Icon, splash image, Android icon layers (the dots mark)
screenshots/              The screens, light and dark
DESIGN-NOTES.md           Palette, type scale, how the hold interaction is built, critique rounds
```

Database: `habits` (id, name, icon, days as a comma-separated list of weekdays with 0 = Sunday,
reminder_time 'HH:MM' or null, created_at) and `completions` (habit_id, day 'YYYY-MM-DD',
unique per habit and day). Streaks are computed from these on the fly in `streaks.ts`.

## Ideas for version two

From the niche research's "leave out of version one" list and what the data model already allows:

- A home-screen widget showing today's ring and the year grid (the HabitKit growth lever).
- A lifetime plan: the research says it sells; needs a non-consumable product and a third package.
- Apple Watch check-offs.
- Friends and shared streaks.
- AI coaching on missed days.
- Backfilling a missed day from the year grid (the `completions` table already supports any day).

## Checks and notes

```bash
npx tsc --noEmit                 # types
npx expo-doctor                  # dependencies and config
npx expo export --platform ios   # the app bundles
```

Notes:

- `react-dom` is pinned only to satisfy Expo Router's dependency tree with npm; the app has no web
  target.
- `supportsTablet` is `false`, so App Store Connect only asks for iPhone screenshots.
- Reminders need a device or simulator with notifications allowed; the switch in Settings asks.

[13]: https://apps.apple.com/us/app/streaks/id963034692
[14]: https://apps.apple.com/us/app/habitify-habit-tracker/id1111447047
[15]: https://apps.apple.com/us/app/id983826477
[17]: https://sebastianroehl.substack.com/p/2025-the-year-that-changed-everything
[18]: https://www.indiehackers.com/post/how-building-in-public-got-my-habit-tracking-mobile-app-to-15k-mo-DCOYyF9O14dBnuGkkaQR
[19]: https://www.indiehackers.com/post/from-0-to-1k-mrr-in-8-months-bootstrapping-habit-pixel-as-a-solo-dev-53d8687d15
[21]: https://trustmrr.com/startup/littleprogress
