# Deepflow

A kitchen-timer for your attention. You turn a dial to set the minutes, put the phone down, and
every session you finish is saved under a label, so the focused hours add up where you can see
them: today, this week, and a streak of days. For students, writers, developers and anyone who
works in blocks and wants proof that the blocks happened.

## Why this niche

Focus timers are small but steady earners: Forest makes $50–93K a month, and 2026 entrants such as a
cat companion app and a town builder reach $20–50K a month by adding a character to a plain
timer. Prices cluster at $3.99–6.99 a month and $19.99–49.99 a year with a one-week trial and the
annual plan pre-selected. Deepflow is the timer-plus-stats core of that pattern, with room to add a
companion in version two.

| App | Price | Revenue |
|---|---|---|
| Forest | $5.99/mo, $35.99/yr early-bird, 1-week trial | $50–93K/mo |
| Focustown (Feb 2026) | $6.99–9.99/mo, $19.99–39.99/yr + coin packs | $50K/mo, 100K+ downloads |
| Cat on Chair | $2.99/mo, $14.99/yr, $24.99 lifetime | $16–20K/mo (unverified) |
| Focus (Meaningful Things) | $6.99/mo, $39.99/yr, 7-day trial | — |
| Focus Keeper | $3.99/mo, $34.99–49.99/yr, annual pre-selected, 1-week trial | under $5K/mo |

Sources: App Store listings for [Forest](https://apps.apple.com/us/app/forest-focus-for-productivity/id866450515),
[Focus Keeper](https://apps.apple.com/us/app/focus-keeper-pomo-study-timer/id867374917) and
[Focus](https://apps.apple.com/us/app/focus-timer-for-productivity/id975017240); ScreensDesign for
[Forest](https://screensdesign.com/showcase/forest-focus-for-productivity) and
[Focus Keeper](https://screensdesign.com/apps/focus-keeper-pomodoro-timer/); Adapty's paywall library for
[Focustown](https://adapty.io/paywall-library/focustown/); [Stork](https://www.stork.ai/blog/this-silly-cat-app-makes-20kmonth)
for Cat on Chair.

## Features

- **The dial.** Drag the knob around a kitchen-timer dial to set 1–60 minutes, one haptic click per
  minute. While a session runs the wedge unwinds and the screen goes calm. Pause, resume, end.
- **Survives the background.** The timer stores the moment the session ends, not a tick count. Lock
  the phone, switch apps, even quit: the session finishes on time and is saved when you come back.
- **Labels.** Type what you are working on or tap a suggestion; your own recent labels float to the
  top.
- **Breaks.** When the dial runs out the session is saved and a break is offered, with its own
  length.
- **History.** Today and this-week totals, a streak of days, a hand-drawn week chart, and every
  session grouped by day. Delete any session.
- **Daily goal.** A number of sessions that makes a full day; the Focus screen shows the dots filling.
- **Alerts.** A notification when a session or break ends, turned on from Settings (never asked on
  first launch).
- **Onboarding** that builds your plan from three answers, a hard paywall with weekly and yearly
  plans (RevenueCat, with a built-in mock so it runs without any keys), Settings, light and dark
  theme, local SQLite storage, a one-command rebrand script.

Stack: Expo SDK 58, Expo Router, TypeScript, React Native StyleSheet, react-native-svg,
react-native-reanimated, react-native-gesture-handler, expo-notifications, expo-sqlite, RevenueCat.

## Screens

1. **Onboarding** (5 steps): welcome; what you focus on (picks the first labels); how long you can
   stay on one thing (sets the dial's default and the break length); sessions per day (the daily
   goal); then "Your plan", computed from the answers.
2. **Paywall**: your dial in its finished state, four benefits, weekly and yearly plans (yearly
   pre-selected with the per-week price and the saving), a trial timeline when the plan has a trial.
3. **Focus** tab: today's goal dots and streak, the dial, the label field with suggestions, Start.
   Running: the tab bar steps away and the screen warms to a calmer tint; countdown, "ends at",
   Pause and End. Done: the saved session (with a success haptic) and the break offer.
4. **History** tab: this week's focused time over a hand-drawn week chart, Today and Streak tiles,
   sessions by day.
5. **Settings** tab: focus length, break length, daily goal, end-of-session alerts, the base rows
   (theme, subscription, legal, rate, contact, version), Delete all sessions, and in development
   Load sample data and Reset app.

## Screenshots

Taken on the iPhone 17 Pro Max simulator during the visual QA pass, in the order of a first run.

| # | Screen | File |
|---|---|---|
| 01 | Onboarding: welcome with the dial | [`01-onboarding-welcome.png`](screenshots/01-onboarding-welcome.png) |
| 02 | Onboarding: what you focus on (labels preview in the dial) | [`02-onboarding-purpose.png`](screenshots/02-onboarding-purpose.png) |
| 03 | Onboarding: session length (the dial turns to the answer) | [`03-onboarding-length.png`](screenshots/03-onboarding-length.png) |
| 04 | Onboarding: sessions a day | [`04-onboarding-goal.png`](screenshots/04-onboarding-goal.png) |
| 05 | Setting your dial | [`05-onboarding-building.png`](screenshots/05-onboarding-building.png) |
| 06 | Your plan | [`06-onboarding-plan.png`](screenshots/06-onboarding-plan.png) |
| 07 | Paywall | [`07-paywall.png`](screenshots/07-paywall.png) |
| 08 | Paywall, dark | [`08-paywall-dark.png`](screenshots/08-paywall-dark.png) |
| 09 | Focus: the dial, ready to turn | [`09-focus.png`](screenshots/09-focus.png) |
| 10 | Focus: the dial turned to 24 minutes | [`10-focus-dial-turned.png`](screenshots/10-focus-dial-turned.png) |
| 11 | Focus session running: the wedge unwinds, the clock below | [`11-focus-running.png`](screenshots/11-focus-running.png) |
| 12 | Focus session running, dark | [`12-focus-running-dark.png`](screenshots/12-focus-running-dark.png) |
| 13 | Focus with today's sessions and a label picked | [`13-focus.png`](screenshots/13-focus.png) |
| 14 | Focus, dark | [`14-focus-dark.png`](screenshots/14-focus-dark.png) |
| 15 | History, nothing saved yet | [`15-history-empty.png`](screenshots/15-history-empty.png) |
| 16 | History: the week, today, streak and sessions | [`16-history.png`](screenshots/16-history.png) |
| 17 | History, dark | [`17-history-dark.png`](screenshots/17-history-dark.png) |
| 18 | Settings | [`18-settings.png`](screenshots/18-settings.png) |
| 19 | Settings, dark | [`19-settings-dark.png`](screenshots/19-settings-dark.png) |

## Run it

You need a Mac with [Xcode](https://apps.apple.com/app/xcode/id497799835) and Node 22.

```bash
npm install
npx expo run:ios
```

The app uses native modules (SVG, Reanimated, gesture handler, SF Symbols, notifications), so it
runs as a development build, not in Expo Go. Without a RevenueCat key the app uses the built-in
paywall and a mock purchase, so you can click through onboarding → paywall → tabs right away. In
Settings there are "Load sample data" and "Reset app" rows (development only).

## Connect RevenueCat

1. Create a project at [app.revenuecat.com](https://app.revenuecat.com) and add your iOS app
   (bundle id must match `ios.bundleIdentifier` in `app.json`).
2. In App Store Connect create two auto-renewable subscriptions (weekly and yearly) in one
   subscription group. Give the yearly one a 7-day free trial as an introductory offer. Add both
   products to RevenueCat.
3. In RevenueCat create an entitlement with the identifier `pro` and attach both products.
4. Create an offering and make it the **default**. Add two packages: **Weekly** (`$rc_weekly`)
   and **Annual** (`$rc_annual`) and attach the matching products.
5. Design a paywall for that offering in RevenueCat → Paywalls and publish it, or keep the built-in
   one (set `ui: 'custom'` in `src/config/paywall.ts`). The built-in paywall reads the trial length
   from the store product, computes the per-week price and the saving from the two prices, and
   shows the "Start my 7-day free trial" button only when the selected plan has a trial.
6. Copy the iOS public API key (starts with `appl_`) and put it in a `.env` file:

   ```bash
   cp .env.example .env
   # EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
   ```

7. Rebuild: `npx expo run:ios`. Purchases are now real (sandbox while testing).

## Rebrand

One command renames the app, slug, bundle id and brand color:

```bash
node scripts/rebrand.mjs --name "Tendtime" --slug tendtime --bundle com.yourname.tendtime --color "#1F6F5F"
```

Then replace the images in `assets/` (`icon.png` 1024×1024, `splash-icon.png`, and the three
Android icon layers) and edit `src/config/app.ts` (support email, terms and privacy URLs). The
dial, buttons and highlights all follow the color you pass; the break color is `BREAK_COLOR` in
`src/theme/theme.ts`.

### Prompt for Claude Code or Cursor

Paste this into your AI coding agent, in the app folder, and fill in the angle brackets:

> Rebrand this focus-timer app. Read README.md and AGENTS.md first.
> 1. Run `node scripts/rebrand.mjs --name "<App Name>" --slug <app-slug> --bundle <com.company.app> --color "<#hex>"`.
> 2. Generate a new `assets/icon.png`, `assets/splash-icon.png` and the three Android icon layers: a flat glyph in the new color, no text.
> 3. Rewrite the copy in `src/config/onboarding.ts` for `<who the app is for, e.g. law students>`. Keep the step ids, the question ids (`purpose`, `sessionLength`, `dailyGoal`) and the option ids for `sessionLength` and `dailyGoal` as numbers of minutes and sessions, because the timer reads them. Change the `purpose` options and the matching label suggestions in `src/features/focus/labels.ts`.
> 4. Rewrite the headline, subheadline and benefits in `src/config/paywall.ts`. Keep the plan ids and package ids.
> 5. Set the support email and legal URLs in `src/config/app.ts`.
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
  _layout.tsx             Root: loads fonts, hydrates state, decides onboarding → paywall → tabs
  paywall.tsx             RevenueCat paywall, or the built-in one without a key
  (onboarding)/           index (step 0) and [step] (1..n)
  (tabs)/                 index (Focus), history/ and settings/ (each a stack; the screen draws its collapsing title)
src/
  components/             Screen (safe areas, 20 pt gutter, pinned CTA), Stack and Row (token gaps),
                          Button, Card, ListRow, Icon, Stepper, ProgressBar, AnimatedNumber, EmptyState, Text
  config/                 app.ts (email, links, entitlement), onboarding.ts, paywall.ts
  db/                     index.ts (open + migrate), migrations.ts, sessions.ts
  features/
    focus/                Dial (the hero), FocusScreen, HistoryScreen, WeekChart, GoalDots,
                          timer.ts (end-timestamp engine), focusSettings.ts, notifications.ts,
                          stats.ts, labels.ts, persistedStore.ts, largeTitle.ts
    onboarding/           OnboardingScreen (live dial previews, the plan step)
    paywall/              CustomPaywall
    settings/             SettingsScreen
  purchases/              getEntitlement / purchase / restore; RevenueCat or mock behind it
  state/appState.ts       Persisted store: onboardingDone, answers, entitled
  theme/theme.ts          Colors (light and dark), fonts, the spacing grid, sizes, radii, typography; useTheme()
scripts/rebrand.mjs       Rename app, slug, bundle id, brand color
assets/                   Icon, splash image, Android icon layers
DESIGN-NOTES.md           Palette, type scale, layout tokens, the dial interaction, screen-by-screen review
```

## Checks and notes

```bash
npx tsc --noEmit                 # types
npx expo-doctor                  # dependencies and config
npx expo export --platform ios   # the app bundles
```

- The timer never counts ticks. `timer.start()` stores `endsAt`; a one-second interval, the
  app-foreground event and the first render after launch all call `settle()`, which compares
  `endsAt` with the clock and saves the session with its planned end time.
- Layout comes from tokens only: every gap and padding is a `theme.spacing` value (an 8-pt grid
  with a 20 pt screen gutter), every color a theme color, every text style a `theme.typography`
  variant. Spacing between siblings comes from `Stack`/`Row` gaps, never margins, so nothing touches.
- Notifications are local only. The permission is requested from the Settings switch; if it was
  denied before, the switch opens iOS Settings instead, because iOS does not ask twice.
- Sessions live in SQLite (`sessions` table). Timer state and focus preferences live in
  AsyncStorage; the onboarding answers seed the preferences until the user changes them.
- `react-dom` is pinned only to satisfy Expo Router's dependency tree with npm; the app has no
  web target. `supportsTablet` is `false`, so App Store Connect only asks for iPhone screenshots.

## Ideas for version two

From the research's "leave out of version one" list:

- A companion that grows while you focus (a plant, a cat, a town), which is what lifted the 2026
  entrants to $20–50K a month.
- App blocking during a session (Screen Time API).
- Group focus rooms.
- A desktop or widget companion, and a lifetime purchase next to the subscriptions.
