# Setlog

A strength workout log for people who lift three or four times a week and want every set written
down: routines, a live set table with weight and reps you scrub with a thumb, a rest timer that starts
itself when you check a set, history with weekly volume, and a personal record for every exercise.
Everything is stored on the phone in SQLite; there is no account and no backend.

## Why this niche

Lifters log every session for years, so retention and lifetime purchases are strong, and the top app
does about 500K downloads a month at $23.99 a year. A set logger with a rest timer and PRs is the
whole product; no backend is needed beyond sync, which this template leaves out of version one.

| App | Price (US App Store, Nov 27 2026) | Notes | Source |
|---|---|---|---|
| Hevy | $2.99–3.99/mo, $23.99/yr, $74.99 lifetime, no trial | #26 Top Free Health & Fitness; $500K–1M/mo revenue est. (Adapty), about 500K downloads/mo | [45], [48], [49] |
| Strong | $4.99/mo, $29.99/yr, $99.99 "Forever" | Free tier capped at 3 routines; $10K+/mo (AppGoblin) | [46], [50] |
| Fitbod | $95.99/yr, no free tier | Paid programs, not a plain log | [47] |

Price pattern: $2.99–4.99 a month, $23.99–29.99 a year, lifetime $74.99–99.99, soft paywall with no
trial. The template keeps the contract's weekly + yearly packages (mock prices $2.49 / $29.99) and a
hard paywall; set the real prices in App Store Connect.

Sources: [45] apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350 ·
[46] apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577 ·
[47] sensai.fit/blog/fitness-app-comparison · [48] adapty.io/paywall-library/hevy ·
[49] screensdesign.com/showcase/hevy-workout-tracker-gym-log ·
[50] appgoblin.info/apps/464254577

## Features

- **Onboarding** (4 steps): welcome (a live slice of the set table: rows land, a PR badge pops, the
  rest bar drains), lifting experience, days a week, then a "Your plan" step that
  writes the starter routines for that experience level while a 1.2 s build moment plays.
  Experience picks the split (Full body A/B, Push/Pull/Legs, or Upper/Lower × 2); days a week sets
  the goal on the week ring.
- **Week** (Home): the week ring hero, seven segments that fill on the days you trained, around
  sessions done against the goal; a resume card for a workout in progress; one-tap start for every
  routine ("up next" is the one that has waited longest); empty workout.
- **Routines**: an "Up next" hero with a Start button, the list, and an editor (name, exercises in
  order, target sets per exercise, delete). The exercise picker is a form sheet with search, 40 built-in
  exercises grouped by muscle, and "Create ‹name›" for your own.
- **Active workout** (the signature interaction): a live header (time, sets done, volume, a progress
  bar) over a dense set table per exercise. Each exercise shows last session's sets under its name and
  its best weight; the fields show last session's numbers faintly. Weight and reps are steppers you
  tap (− / +), type into, or drag horizontally to scrub with a haptic tick per step. Checking a set
  fills any blanks from last time, lands with a heavy haptic and a spring on the check, swaps the set
  number for a popping PR badge when the weight beats the exercise's best, and slides up a rest-timer
  sheet whose bar drains in real time (−15 s / +15 s / Skip, swipe down to dismiss; it does not block
  the table). Add sets, add exercises, remove either; discard or finish.
- **Workout summary**: total volume counting up, time, sets, exercises, records, every set, delete.
- **History**: weekly volume bar chart for the last eight weeks (this week highlighted), the workout
  list with PR counts; a Records segment with every exercise's heaviest set and estimated 1RM (Epley).
- **Exercise detail**: heaviest set, est. 1RM, sessions, a line of the top set per session, the log.
- **Settings**: units (kg / lb, stored in kg), rest timer length, weekly goal, delete all workouts,
  plus the base rows (theme, subscription status, restore, manage, terms, privacy, rate, contact,
  version). Development only: load five weeks of sample data, reset app.
- **Paywall**: custom design (hero in its success state, personalised with the chosen split and goal),
  four benefit rows, plan selector with per-week price and the computed saving, a CTA that says what
  happens. Hard: no close button. RevenueCat Paywalls stay available when a key is set.
- Light and dark themes designed separately; Barlow Condensed for numbers and headings, Barlow for
  body; SF Symbols on iOS; Reduce Motion respected everywhere.

No reminders: a set logger does not need notifications, so `expo-notifications` stays installed but
unused, as in the base.

Stack: Expo SDK 58, Expo Router, TypeScript, React Native StyleSheet, react-native-svg,
react-native-reanimated, react-native-gesture-handler, expo-symbols, RevenueCat, expo-sqlite.

## Screens

Onboarding (welcome, experience, days a week, your plan) · Paywall · Week (Home) · Routines ·
Routine editor · Exercise picker (form sheet) · Active workout with the rest-timer sheet · Workout
summary · History (workouts and records) · Exercise detail · Settings. Every main screen is designed in
dark (the default look of the brand) and light. Turn on "Load sample data" in Settings (development
builds only) to see every screen populated, e.g. for App Store screenshots.

## Screenshots

Taken on the iPhone 17 Pro Max simulator during the visual QA pass, in the order of a first run.

| # | Screen | File |
|---|---|---|
| 01 | Onboarding: the live set table | [`01-onboarding-welcome.png`](screenshots/01-onboarding-welcome.png) |
| 02 | Onboarding: how long you have been lifting (split preview) | [`02-onboarding-experience.png`](screenshots/02-onboarding-experience.png) |
| 03 | Onboarding: days a week (week ring) | [`03-onboarding-days.png`](screenshots/03-onboarding-days.png) |
| 04 | Building the plan | [`04-onboarding-building.png`](screenshots/04-onboarding-building.png) |
| 05 | Your plan | [`05-onboarding-plan.png`](screenshots/05-onboarding-plan.png) |
| 06 | Paywall | [`06-paywall.png`](screenshots/06-paywall.png) |
| 07 | Paywall, dark | [`07-paywall-dark.png`](screenshots/07-paywall-dark.png) |
| 08 | This week, first day | [`08-home.png`](screenshots/08-home.png) |
| 09 | Active workout: the set table | [`09-workout.png`](screenshots/09-workout.png) |
| 10 | Weight scrubbed and stepped, reps set | [`10-workout-set.png`](screenshots/10-workout-set.png) |
| 11 | Set checked: PR badge and the rest timer sheet draining | [`11-rest-timer.png`](screenshots/11-rest-timer.png) |
| 12 | Workout saved: volume, records | [`12-workout-summary.png`](screenshots/12-workout-summary.png) |
| 13 | This week with sample data, goal reached | [`13-home-week-done.png`](screenshots/13-home-week-done.png) |
| 14 | This week, dark | [`14-home-dark.png`](screenshots/14-home-dark.png) |
| 15 | Routines | [`15-routines.png`](screenshots/15-routines.png) |
| 16 | Routines, dark | [`16-routines-dark.png`](screenshots/16-routines-dark.png) |
| 17 | History: weekly volume and sessions | [`17-history.png`](screenshots/17-history.png) |
| 18 | History, dark | [`18-history-dark.png`](screenshots/18-history-dark.png) |
| 19 | History: personal records | [`19-records.png`](screenshots/19-records.png) |
| 20 | Settings | [`20-settings.png`](screenshots/20-settings.png) |
| 21 | Settings, dark | [`21-settings-dark.png`](screenshots/21-settings-dark.png) |

## Run it

You need a Mac with [Xcode](https://apps.apple.com/app/xcode/id497799835) and Node 22.

```bash
npm install
npx expo start
```

Press `i` to open the iOS simulator. Without a RevenueCat key the app uses the built-in paywall and a
mock purchase, so you can click through onboarding → paywall → tabs right away. In Settings there is a
"Load sample data" row (development only) that writes five weeks of workouts, and a "Reset app" row to
go back to the first launch.

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
5. Either design a paywall for that offering in RevenueCat → Paywalls and publish it, or set
   `ui: 'custom'` in `src/config/paywall.ts` to keep the built-in design (recommended; it shows the
   user's plan and computes the saving from the store prices).
6. Copy the iOS public API key (starts with `appl_`) and put it in a `.env` file:

   ```bash
   cp .env.example .env
   # EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
   ```

7. Rebuild: `npx expo run:ios`. Purchases are now real (sandbox while testing).

## Rebrand

One command renames the app, slug, bundle id and accent color:

```bash
node scripts/rebrand.mjs --name "Repbook" --slug repbook --bundle com.yourname.repbook --color "#F2A93B"
```

Then replace the images in `assets/` (`icon.png` 1024×1024, `splash-icon.png`, the three Android icon
layers; the current ones are a barbell glyph you can regenerate from any SVG), set the adaptive icon
and splash colors in `app.json` if your palette changes, and edit `src/config/app.ts` (support email,
terms and privacy URLs). Palette and type live in `src/theme/theme.ts`.

### Prompt for Claude Code or Cursor

Paste this into your AI coding agent, in the app folder, and fill in the angle brackets:

> Rebrand this workout log as `<App Name>`. Read README.md, AGENTS.md and DESIGN-NOTES.md first.
> 1. Run `node scripts/rebrand.mjs --name "<App Name>" --slug <app-slug> --bundle <com.company.app> --color "<#hex>"`.
> 2. In `src/theme/theme.ts` adjust the dark and light palettes to the new accent if needed (keep
>    contrast AA; `accentText` is the accent darkened for light mode). Keep Barlow unless the brand
>    has its own typeface; if you change it, swap the `@expo-google-fonts` package and the `fonts` map.
> 3. Rewrite the copy in `src/config/onboarding.ts` (titles, bodies, option labels; keep the question
>    ids `experience` and `daysPerWeek`, the plan step and the shape) and `src/config/paywall.ts`
>    (headline, subheadline, benefits, mock prices). Keep the plan ids and package ids.
> 4. Set the support email and legal URLs in `src/config/app.ts`.
> 5. Replace the images in `assets/` with the new icon (no text in the icon).
> 6. If the brand wants different starter routines or exercises, edit
>    `src/features/routines/starterRoutines.ts` and `src/db/exerciseLibrary.ts` (ids are stable slugs).
> 7. Finish with `npx tsc --noEmit`, `npx expo-doctor` and `npx expo export --platform ios`, all clean.
>    No TODOs, placeholder text or unused code.

## Ship it

1. Create an [Apple Developer](https://developer.apple.com/programs/) account ($99/year) and an
   [Expo](https://expo.dev) account.
2. Install EAS: `npm install -g eas-cli`, then `eas login` and `eas build:configure`.
3. Put your RevenueCat key in EAS so the production build has it:
   `eas env:create --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value appl_xxx --environment production`
4. Build: `eas build --platform ios --profile production`. EAS creates the certificates for you.
5. In [App Store Connect](https://appstoreconnect.apple.com) create the app with the same bundle id,
   fill in the listing (screenshots, description, privacy policy URL, the two subscriptions), then
   `eas submit --platform ios` uploads the build.
6. Test the paywall with a Sandbox tester account, then submit for review. Apple asks for a
   terms-of-use link in the app description for subscription apps; `src/config/app.ts` holds the same
   URL used inside the app.

## Folder map

```
app/                      Routes. Thin files that render a screen from src/features.
  _layout.tsx             Root: loads fonts, hydrates state, onboarding → paywall → tabs + stack screens
  paywall.tsx             RevenueCat paywall, or the built-in one without a key
  (onboarding)/           index (step 0) and [step] (1..3)
  (tabs)/                 index (Week), routines, history, settings
  routine/[id].tsx        Routine editor ("new" or an id)
  workout/active.tsx      The live set table
  workout/[id].tsx        Finished workout summary
  exercise/[id].tsx       Exercise history and records
  exercise-picker.tsx     Form sheet to add exercises
src/
  components/             Screen (collapsing large title, 20 pt gutter, pinned footer), Layout (Stack,
                          Row, Fill, Section, Group, Badge), Button, Card, ListRow, Icon (SF Symbols),
                          Text, Scrubber, Sheet, OptionSheet, SegmentedControl, ProgressBar, Stat,
                          BarChart, LineChart, AnimatedNumber, EmptyState, illustrations
  config/                 app.ts (email, links, entitlement), onboarding.ts, paywall.ts
  db/                     index.ts (open + migrate), migrations.ts, exerciseLibrary.ts (seed),
                          exercises.ts, routines.ts, routineExercises.ts, workouts.ts, workoutSets.ts
  features/
    home/                 HomeScreen, WeekRing (hero), weeklyGoal
    onboarding/           OnboardingScreen (progress bar, live previews, the plan step),
                          SetTablePreview (the welcome step's hero)
    paywall/              CustomPaywall
    routines/             RoutinesScreen, RoutineEditorScreen, starterRoutines
    exercises/            ExercisePickerScreen, ExerciseDetailScreen, exercisePicks
    workout/              ActiveWorkoutScreen, SetRow, RestTimerSheet, useRestTimer,
                          WorkoutDetailScreen, startWorkout, useBeginWorkout, format
    history/              HistoryScreen (workouts + records)
    settings/             SettingsScreen, sampleData (development only)
  purchases/              getEntitlement / purchase / restore; RevenueCat or mock behind it
  state/appState.ts       Persisted store: onboardingDone, answers, entitled, units, rest, goal
  theme/theme.ts          Palette (dark and light), fonts, type scale, spacing, radii; useTheme()
scripts/rebrand.mjs       Rename app, slug, bundle id, accent color
assets/                   Icon, splash image, Android icon layers
DESIGN-NOTES.md           Palette, type scale, layout rules, the signature interaction, screen review
```

Tables: `exercises` (seeded with 40, plus custom), `routines`, `routine_exercises`, `workouts`,
`workout_sets` (weight in kg, reps, completed, is_pr). One migration creates them all.

## Checks and notes

```bash
npx tsc --noEmit                 # types
npx expo-doctor                  # dependencies and config
npx expo export --platform ios   # the app bundles
```

- Layout: every spacing, color and text style comes from `src/theme/theme.ts` (8-pt grid, 20 pt
  gutter). Screens are built from `Stack` / `Row` / `Section` with `gap`, so siblings never touch;
  numbers shrink to fit instead of wrapping. Keep to that when you add screens.

- Weights are stored in kilograms; the units setting converts on display and input (2.5 kg / 5 lb
  steps on the scrubber).
- A personal record is a completed set heavier than every earlier finished set of that exercise.
  Records are flagged when a workout is finished and shown live while you log.
- `expo-notifications`, `expo-audio`, `expo-blur` (used by the rest-timer sheet), `expo-linear-gradient`
  and `expo-dev-client` are installed at the versions compiled into the shared development build; the
  unused ones can be removed with `npm uninstall` once you build your own binary.
- `react-dom` is pinned only to satisfy Expo Router's dependency tree with npm; the app has no web
  target. `supportsTablet` is `false`, so App Store Connect only asks for iPhone screenshots.

## Ideas for version two

From the research's "leave out of version one": cloud sync and a social feed, AI-written programs,
Apple Watch / wearable logging, exercise demo videos, body-weight and measurement tracking, and a
lifetime purchase next to the subscriptions (Hevy and Strong both sell one).
