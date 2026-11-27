# Daily Dots — design notes

Feel: playful-precise, tactile (references for taste only: Streaks, Structured). The one idea is
the dot: a habit done is a dot, a day is a row of dots, a year is a grid of dots. The accent is
used only where the user acts or has succeeded; everything else is neutral.

## Palette (`src/theme/theme.ts`)

| Token | Light | Dark | Used for |
|---|---|---|---|
| background | `#F7F6FB` | `#121022` | screen |
| surface | `#FFFFFF` | `#1C1A30` | cards, tiles, settings groups |
| surfaceSunken | `#F1EFF8` | `#161429` | fields, stat tiles, empty ring tracks |
| border | `#E5E2F0` | `#2D2A45` | 1–1.5 pt hairlines, missed-day cells |
| text | `#17152B` | `#F2F0FA` | ink |
| textMuted | `#77738F` | `#9B97B5` | captions, secondary |
| primary | `#5B4BDB` | `#5B4BDB` lifted 25% toward white | hero ring, done state, primary action, selection |
| primarySoft | primary at 10% | lifted primary at 18% | selected card fill, icon wells |
| onPrimary | `#FFFFFF` | `#14122A` | text and icons on the accent (dark uses ink: white on the lifted accent is under AA) |
| streak | `#FFB547` | `#FFC266` | flame, streak chips, the today outline on the year grid; nowhere else |

Dark is not inverted light: surfaces are lifted above the background, the accent is desaturated
by mixing toward white (computed from `PRIMARY_COLOR`, so the rebrand script keeps working), and
text on the accent flips to ink.

## Type scale

Bricolage Grotesque for anything with character; Figtree for anything read quickly.

| Variant | Face | Size / line | Tracking | Notes |
|---|---|---|---|---|
| numeral | Bricolage 800 | 72 / 76 | −3 | hero numbers, `tabular-nums`, Dynamic Type capped at 1.3× |
| numeralSmall | Bricolage 700 | 28 / 32 | −0.8 | stat tiles, time stepper, `tabular-nums` |
| display | Bricolage 700 | 40 / 44 | −1.2 | large screen titles |
| title | Bricolage 700 | 30 / 36 | −0.8 | onboarding and paywall titles |
| heading | Bricolage 600 | 20 / 26 | −0.3 | card headings |
| body | Figtree 400 | 17 / 24 | 0 | |
| label | Figtree 600 | 15 / 20 | 0 | buttons, tile names, rows |
| caption | Figtree 500 | 13 / 18 | 0 | secondary, axis labels |

## Signature interaction: press-and-hold to check off

`src/features/habits/HoldToComplete.tsx`

- A `Gesture.LongPress` with `minDuration` 600 ms and `maxDistance` 30 pt wraps the whole tile.
  `onBegin` starts a 600 ms `withTiming` on a `progress` shared value (ease in-out) and springs the
  tile to 0.97; `onStart` (the hold completed) flips a `base` shared value on the UI thread, pops
  the tile (`withSequence` of two springs, 1.06 → 1) and commits on the JS thread;
  `onFinalize(success = false)` springs `progress` back to 0.
- A `useAnimatedReaction` watches `progress` cross 0.35 / 0.65 / 0.9 and fires light, medium and
  heavy impact haptics, so the ticks rise as the ring closes; the commit fires a success haptic.
- `HoldRing` draws the ring with `react-native-svg`: an `AnimatedCircle` whose `strokeDashoffset`
  is `circumference × (1 − fill)`, where `fill = base + (1 − 2·base)·progress`. Not done: the ring
  fills from empty. Done: the ring is full and a second hold drains it to undo. `base` flips at
  commit on the UI thread, so the ring never flashes empty while the database write finishes.
- A `Gesture.Tap` composed with `Gesture.Exclusive` opens the habit on a plain tap.
- Reduce Motion: no ring animation, the tile fades to 60% while held and the commit is instant.
- Accessibility: the tile is one button with `activate` (open) and `longpress` (toggle) actions.

Everything else that moves answers an action: the Today ring's arcs spring in per habit as it
is checked (`TodayRing`), numbers count up (`AnimatedNumber`, a read-only TextInput driven by
`useAnimatedProps`), tiles and rows enter with `FadeInDown` layout animations, the onboarding
clock hands spring to the chosen check-in time, the weekly bars grow in.

## Hero elements

- Today: the segmented ring (one arc per habit due today, 240 pt) with the done count in the
  middle; 40–50% of the first screen.
- Progress: the perfect-days numeral with a flame, then the week bars.
- Detail: the streak numeral, then the GitHub-style year grid (53 × 7 rounded squares drawn in one
  `Svg`, month labels, today outlined in the streak color).
- Paywall: the ring fully closed with "Day 1" and a flame, personalised with the number of habits
  the plan step created.

## Gaps found on takeover (second agent) and how they were closed


1. Paywall subtitle repeated itself and read like a disclaimer. Now the headline names the plan
   ("Your 4 habits are ready") and one line names the check-in ("Evening check-in, reminder at
   6:30 PM. Try it all free for a week."). Benefits cut to one line each.
2. Today ring was a hole in dark mode at 0: empty segments used `surfaceSunken`, which is almost the
   background. New `track` token (light `#E7E4F2`, dark `#2E2B48`) for empty ring segments, the
   year grid's missed days and the welcome grid. The ring pops (spring to 1.045 and back) on every
   completion; the centre caption moved from caption to label size.
3. Habit tiles were all the same bordered card. Done tiles now fill with the accent (text, icon,
   streak and check in `onPrimary`); pending tiles are a quiet borderless surface with a muted
   streak. The hold ring inverts on the accent so the undo-hold still reads. The detail screen's
   hold card follows the same rule.
4. Onboarding welcome was a small dots mark over an empty half screen. It is now five weeks of one
   habit filling in cell by cell (springs, staggered 22 ms) with today outlined in the streak color
   and a "13 days in a row" chip, and every step's block is centred in the space above the CTA.
5. "Your plan" had no visual: a live ring with one segment per ticked habit now sits on top and
   changes as habits are unticked.
6. Layout rules (2b): 20 pt gutter (`spacing.gutter`) on every screen, 12 pt between siblings
   (`spacing.item`), 8 pt icon-to-label in chips and streak rows, no raw spacing numbers in
   StyleSheets, chips 12 × 4–8 pt padding, footer CTA has 8 pt above it so it never touches
   scrolled content, tab screens end with 32 pt of padding (the JS tab bar sits below the scene,
   so content is never under it).
7. Progress: the current-week bar label was clipped ("This wee"); it is now "Now". The best-streak
   tile no longer appends the habit name (it wrapped to three lines).
8. `expo-audio`, `expo-blur`, `expo-linear-gradient` and `expo-asset` were installed but unused;
   removed with their config plugins. Splash backgrounds now match the palette.

## Screenshot rounds

### Round 1 (second agent): critique → change

- Welcome: block now centred, but the grid read small. Cells 34 → 40 pt.
- Plan: "4" touched "a day" inside the ring (audit). Ring children get an 8 pt gap.
- Paywall: the trial timeline was hidden under the CTA and the audit flagged it. Ring 148 → 120,
  benefit wells 36 → 32, one-line subtitle, shorter footnote and timeline captions; everything now
  fits above the CTA on a 6.9" screen. Links got a 12 pt hit slop.
- Today: the add button touched the large title; title to subtitle was 4 pt. Compact bar gets 8 pt
  below it, subtitle 8 pt. Tiles with a two-line name were taller than their neighbours: names
  reserve two lines. The perfect-days chip was left-aligned under a centred ring: now centred.
- Sample data left today empty, so populated screenshots never showed the done state: two habits
  are now done today.
- Progress, detail, stat tiles: number-to-caption gaps were 4 pt (audit). All 8 pt.
- Settings: section titles sat 4 pt above their group; now 12 pt. Editor stepper label 4 → 8 pt.
- Detail header: back and edit buttons touched the title; 8 pt gap.

### Round 2: critique → change

- Paywall "Save 81%" badge: streak orange on its own tint failed contrast. Text is ink, semibold.
- `08-today-one-done` showed the tile still at 1.06 scale 2.5 s after the commit (audit EDGE 14 pt):
  the re-render after the database write cut the pop's settle spring short, so the tile never came
  back to rest. `HoldToComplete` now springs the scale back to 1 whenever `done` changes. Round 3
  confirmed: audit clean, tile at rest.

Final set: `screenshots/01-…17-…png`, every kept shot audited (clean, or only the findings below).

### Audit findings kept on purpose

- Tab bar buttons touching each other, touching the screen edges and sitting over the home
  indicator: the system tab bar (Expo Router JS tabs), not app content.
- Grouped settings rows touching vertically (0 pt): inset grouped rows with hairline dividers, the
  iOS pattern; each row has 16 pt inner padding.
- Settings and Today rows reported over the tab bar or the home indicator: rows scrolled below the
  visible area, which the accessibility tree still lists. They scroll clear with 32 pt to spare.
- Editor sheet: overlaps with "90%", "109", "Delete habit" and the hold card belong to the detail
  screen underneath the form sheet, which the accessibility tree also lists.
- Editor: "Remind me" switch touching its label (one row, the switch is the row's control); hour
  and minute down/up buttons touching (each pair is one segmented stepper).


  large-title layout moved behind `Screen`, so every screen goes through one safe-area primitive);
  the tab label style is a `typography.tabLabel` token instead of a raw font literal. Lint: clean.
- Text that cannot break the layout: every numeral in a `Text` has `numberOfLines={1}`,
  `adjustsFontSizeToFit` and a `minimumFontScale`; list titles (settings rows, plan rows, progress
  rows) truncate to one line; row text containers have `flex: 1` + `minWidth: 0`. Hero numerals
  use `AnimatedNumber` (a read-only TextInput, which cannot auto-shrink); they show streak and day
  counts, at most four digits, which fit the full-width hero at 72 pt.

## Screen-by-screen self-review against DESIGN.md 2 and 2b

| Screen | Hero | Layout (2b) | Notes |
|---|---|---|---|
| Onboarding welcome | five-week grid filling in, streak chip | block centred above the CTA, 20 pt gutter, chip 12 × 6 pt, flame 8 pt from label | dead gap ≈ 20% |
| Onboarding focus | four starter tiles that switch with the answer | options 12 pt apart, 54 pt CTA 16 pt above the home inset | |
| Onboarding check-in | clock whose hands spring to the time | same | |
| Your plan | ring with one segment per ticked habit | 1.2 s build moment (dots fill), rows 16 pt apart, names truncate | numbers in ring 8 pt apart |
| Paywall | closed ring, "Day 1", headline with habit count | fits above the CTA on 6.9"; benefits 12 pt apart; sections 24 pt; badge 12 × 6 pt in ink | hard, no close |
| Today | segmented ring (track visible in both schemes), pops on each completion | tiles measured from width − 2 × 20 − 12, equal heights (names reserve two lines); done tiles accent, pending quiet | perfect-days chip centred |
| Progress | perfect-days numeral + flame | hand-drawn week bars ("Now" label), stat tiles 16 pt padding with 8 pt number-to-caption | |
| Habit detail | streak numeral, year grid | hold card turns accent when done; header buttons 8 pt from title | |
| Habit editor (form sheet) | — (a form) | 20 pt gutter, 12 pt section titles, steppers 8 pt under labels | |
| Settings | — (grouped rows) | inset grouped rows, section titles 12 pt above groups, 32 pt bottom padding | |
