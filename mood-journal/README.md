# Daymood

A mood and gratitude journal for iPhone. Once a day you slide a face along a color field to
how you feel, tap what shaped the day, and write a line. The days become a year in pixels,
and Trends shows which parts of life travel with your good days and your hard ones. For
people who want one honest minute a day, not a therapy app.

## Why this niche

Plain mood diaries earn little: Daylio makes under $10K a month on nine million installs
[[62]](https://appgoblin.info/apps/1194023242). The gamified, personal version makes about a million
a month: Finch is #16 in Top Free Health & Fitness with 780K ratings
[[16]](https://apps.apple.com/us/app/finch-self-care-pet/id1528595748) and roughly $1M/month
[[58]](https://adapty.io/paywall-library/finch/), 9.7M active users in Dec 2025
[[61]](https://sensortower.com/blog/2025-q4-unified-top-5-health-and-fitness-units-us-600af518241bc16eb8dce802).
Daymood takes the journal, the streak and the personal prompt, and sells it at $39.99 a year.

| App | Monthly | Yearly | Lifetime | Source |
|---|---|---|---|---|
| Finch (Finch Plus) | $5.99–9.99 | $39.99–69.99 | — | [16](https://apps.apple.com/us/app/finch-self-care-pet/id1528595748), [58](https://adapty.io/paywall-library/finch/) |
| Daylio | $4.99 | $35.99 | $59.99 | [59](https://apps.apple.com/us/app/daylio-journal-mood-tracker/id1194023242) |
| How We Feel | free (nonprofit) | — | — | [60](https://dev.to/astraedus/mood-trackers-without-a-subscription-free-no-paywall-3291) |

Finch's onboarding asks what you want help with, your current mood and your reminder times
[[63]](https://screensdesign.com/showcase/finch-self-care-pet); Daymood asks the first and the last.

## Features

- Onboarding: what you want from a journal (sets your daily prompt), when you check in (sets
  the reminder hour), then a "your journal is ready" plan built from the answers
- Hard paywall with weekly and yearly plans, the yearly one with a 7-day trial timeline
  (RevenueCat, with a mock so it runs without keys)
- Today: the mood dial (drag the face along a curved color field, the screen tints with
  the mood), twelve tags, a gratitude or free-text line, a streak with a plant that grows
- Journal: a year in pixels, tap a square to open or add that day, entries as pages
- Trends: a hand-drawn mood line for 7, 30 or 90 days, the mix of moods, and the tags that
  lift you or weigh on you
- Optional daily reminder, asked for from Settings, never on first launch
- Light and dark, Newsreader + Work Sans, SF Symbols on iOS

Stack: Expo SDK 58, Expo Router, TypeScript, React Native StyleSheet, react-native-svg,
Reanimated, Gesture Handler, RevenueCat, expo-sqlite, expo-notifications.

## Screens

- **Onboarding** (4 steps, progress bar on top, button pinned at the bottom): the welcome step
  lets you drag the mood dial right away and the screen takes on the color; "what would you like
  from this" shows the daily prompt your answer sets on a journal page; "when is a good moment"
  moves a sun or moon to your hour; "your journal is ready" builds the plan line by line (about
  1.5 s) while a seed in a pot sprouts.
- **Paywall**: the dial in its happiest state on a warm wash, your check-in hour and prompt,
  four benefits, weekly and yearly plans (yearly pre-selected, per-week price and "Save NN%"
  computed from the prices), a 7-day trial timeline, Restore · Terms · Privacy. No close button.
- **Today**: the date, the dial, twelve tags with icons, gratitude or free text, Save. Once saved
  the day reads as a page: the mood word, tags in the mood color, your line in the serif, and
  the streak plant with how far it is to the next stage.
- **Journal**: the year in pixels (tap any past square to open or add that day as a sheet), the
  year switcher, and the entries as pages.
- **Trends**: a hand-drawn mood line for 7, 30 or 90 days (90 as weekly means), the average and
  the streak, the mix of moods, and the tags that lift you or weigh on you.
- **Settings**: daily reminder and its hour, theme, subscription rows, legal links, rate,
  contact, version, erase data, and (development only) sample data and reset.

Every screen has a designed light and dark palette.

## Screenshots

Taken on the iPhone 17 Pro Max simulator during the visual QA pass, in the order of a first run.

| # | Screen | File |
|---|---|---|
| 01 | Onboarding: welcome, try the dial | [`01-onboarding-welcome.png`](screenshots/01-onboarding-welcome.png) |
| 02 | Onboarding: the face dragged to Great, the screen tints | [`02-onboarding-mood-great.png`](screenshots/02-onboarding-mood-great.png) |
| 03 | Onboarding: what brings you here (prompt preview) | [`03-onboarding-goal.png`](screenshots/03-onboarding-goal.png) |
| 04 | Onboarding: check-in time | [`04-onboarding-time.png`](screenshots/04-onboarding-time.png) |
| 05 | Putting your journal together | [`05-onboarding-building.png`](screenshots/05-onboarding-building.png) |
| 06 | Your journal is ready | [`06-onboarding-plan.png`](screenshots/06-onboarding-plan.png) |
| 07 | Paywall | [`07-paywall.png`](screenshots/07-paywall.png) |
| 08 | Paywall, dark | [`08-paywall-dark.png`](screenshots/08-paywall-dark.png) |
| 09 | Today, before the check-in | [`09-today-empty.png`](screenshots/09-today-empty.png) |
| 10 | Today: mood, tags and prompt picked | [`10-today-checkin.png`](screenshots/10-today-checkin.png) |
| 11 | Writing the note (scrolled above the keyboard) | [`11-today-writing.png`](screenshots/11-today-writing.png) |
| 12 | Today after saving | [`12-today-saved.png`](screenshots/12-today-saved.png) |
| 13 | Today with sample data | [`13-today.png`](screenshots/13-today.png) |
| 14 | Today, dark | [`14-today-dark.png`](screenshots/14-today-dark.png) |
| 15 | Journal: the year in pixels | [`15-journal.png`](screenshots/15-journal.png) |
| 16 | Journal, dark | [`16-journal-dark.png`](screenshots/16-journal-dark.png) |
| 17 | Trends, not enough days yet | [`17-trends-empty.png`](screenshots/17-trends-empty.png) |
| 18 | Trends: 30-day line, average, streak, the mix | [`18-trends.png`](screenshots/18-trends.png) |
| 19 | Trends, dark | [`19-trends-dark.png`](screenshots/19-trends-dark.png) |
| 20 | Settings | [`20-settings.png`](screenshots/20-settings.png) |
| 21 | Settings, dark | [`21-settings-dark.png`](screenshots/21-settings-dark.png) |

## Run it

You need a Mac with [Xcode](https://apps.apple.com/app/xcode/id497799835) and Node 22.

```bash
npm install
npx expo run:ios
```

The app uses native modules (RevenueCat, SVG, Reanimated, notifications), so it needs a
development build rather than Expo Go. Without a RevenueCat key it uses the built-in paywall
and a mock purchase, so you can click through onboarding → paywall → tabs right away. In
Settings, "Load sample data" (development only) fills ten weeks of days for App Store screenshots, and
"Reset app" goes back to the first launch.

## Connect RevenueCat

1. Create a project at [app.revenuecat.com](https://app.revenuecat.com) and add your iOS app
   (bundle id must match `ios.bundleIdentifier` in `app.json`).
2. In App Store Connect create two auto-renewable subscriptions (weekly and yearly) in one
   subscription group. Give the yearly one a 7-day free introductory offer, or remove
   `trialDays` from `src/config/paywall.ts`. Add both products to RevenueCat.
3. In RevenueCat create an entitlement with the identifier `pro` and attach both products.
4. Create an offering and make it the **default**. Add two packages: **Weekly** (`$rc_weekly`)
   and **Annual** (`$rc_annual`) and attach the matching products.
5. Copy the iOS public API key (starts with `appl_`) and put it in a `.env` file:

   ```bash
   cp .env.example .env
   # EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
   ```

6. Rebuild: `npx expo run:ios`. The purchases are now real (sandbox while testing).

The app ships with its own paywall (`ui: 'custom'` in `src/config/paywall.ts`). To use a
paywall designed in RevenueCat → Paywalls instead, publish one for the offering and set
`ui: 'revenuecat'`.

## Rebrand

One command renames the app, slug, bundle id and brand color:

```bash
node scripts/rebrand.mjs --name "Moodling" --slug moodling --bundle com.yourname.moodling --color "#D96C8A"
```

Then replace the images in `assets/` (`icon.png` 1024×1024, `splash-icon.png`, and the three
Android icon layers) and edit `src/config/app.ts` (support email, terms and privacy URLs).
The mood scale colors live in `src/theme/theme.ts` (`colors.mood`) if you want a different
five.

### Prompt for Claude Code or Cursor

Paste this into your AI coding agent, in the app folder, and fill in the angle brackets:

> Rebrand this mood journal as `<App Name>`. Read README.md and AGENTS.md first.
> 1. Run `node scripts/rebrand.mjs --name "<App Name>" --slug <app-slug> --bundle <com.company.app> --color "<#hex>"`.
> 2. Rewrite the copy in `src/config/onboarding.ts` in the new brand's voice. Keep the four
>    steps, the question ids `focus` and `checkInTime`, and their option ids: the prompts in
>    `src/features/journal/prompts.ts` and the reminder hours in
>    `src/features/reminders/reminders.ts` read them.
> 3. Rewrite the headline, subheadline and benefits in `src/config/paywall.ts`. Keep the plan
>    ids and package ids; set `trialDays` to match the App Store introductory offer.
> 4. Set the support email and legal URLs in `src/config/app.ts`.
> 5. Adjust the tag list in `src/features/journal/tags.ts` and the mood words in
>    `src/features/journal/moods.ts` if the brand wants different ones.
> 6. Replace the images in `assets/` with the new icon and splash (no text in the icon).
> 7. Finish with `npx tsc --noEmit`, `npx expo-doctor` and `npx expo export --platform ios`,
>    all clean. No TODOs, placeholder text or unused code.

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
  paywall.tsx             RevenueCat paywall, or the built-in one
  (onboarding)/           index (step 0) and [step] (1..3)
  (tabs)/                 Today, Journal, Trends, Settings
  day/[day].tsx           Sheet to edit or add one day
  reminder-time.tsx       Sheet to pick the reminder hour
src/
  components/             Screen (safe areas, gutter, collapsing large title, tab-bar
                          padding, pinned footer), Stack, Row, Section, Group, BottomCTA,
                          Button, Card, Chip, ListRow, Icon, EmptyState, ProgressDots,
                          AnimatedNumber, Text
  config/                 app.ts (email, links, entitlement), onboarding.ts, paywall.ts
  db/                     index.ts (open + migrate), migrations.ts, checkIns.ts, checkInTags.ts
  features/journal/       Today, Journal, Trends, Day screens; MoodDial, MoodFace, Plant,
                          YearPixels, TrendLine; moods, dates, streak, prompts, tags
  features/reminders/     reminders.ts (schedule, settings) and the time sheet
  features/onboarding/    OnboardingScreen and the "your plan" step
  features/paywall/       CustomPaywall
  features/settings/      SettingsScreen
  purchases/              getEntitlement / purchase / restore; RevenueCat or mock behind it
  state/appState.ts       Persisted store: onboardingDone, answers, entitled
  theme/theme.ts          Palette (light and dark), mood scale, plant colors, fonts, type
                          scale, 8-pt spacing, layout sizes; useTheme()
scripts/rebrand.mjs       Rename app, slug, bundle id, brand color
assets/                   Icon, splash image, Android icon layers
DESIGN-NOTES.md           Palette, type scale, the dial, layout rules and the screen review
```

## Checks and notes

```bash
npx tsc --noEmit                 # types
npx expo-doctor                  # dependencies and config
npx expo export --platform ios   # the app bundles
```

Notes:

- Data stays on the device in SQLite (`check_ins`, `check_in_tags`). There is no account.
- The reminder is a local notification scheduled daily at the chosen hour; permission is
  requested the first time the switch is turned on.
- `react-dom` is pinned only to satisfy Expo Router's dependency tree with npm; the app has
  no web target. `supportsTablet` is `false`, so App Store Connect only asks for iPhone
  screenshots.

## Ideas for version two


- A companion that grows beyond the streak plant (Finch's pet is its retention engine)
- Custom tags and a second check-in per day
- Photos on an entry
- Export to CSV or PDF
- Guided reflections or AI summaries of a month
- Weekly recap notification with the week's pixels
