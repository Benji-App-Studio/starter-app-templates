# Design notes: Lean Hours

Feel: night-calm, dark-first. The app is checked at 11 PM and at 7 AM; nothing on it should shout.
The accent is used for the hero arc, the one primary action and selection. Gold appears only when a
goal is reached. Everything else is neutral.

## Palette (`src/theme/theme.ts`)

| Token | Dark (designed first) | Light |
|---|---|---|
| background | `#0C1020` | `#F4F6FB` |
| surface | `#151A2E` | `#FFFFFF` |
| surfaceRaised (chips, ring track, step controls) | `#1D2440` | `#EAEEF7` |
| border | `#262D4A` | `#DCE1EE` |
| text | `#EEF1FA` | `#0C1020` |
| textMuted | `#8D93AD` | `#5F6782` |
| primary (accent, from the brief) | `#2F6FE0` | `#2F6FE0` |
| primarySoft (selected fills) | accent at 24% | accent at 12% |
| gold (goal reached, completed, streak) | `#F2B84B` | `#C98F1F` (darkened for contrast on white) |
| goldSoft (fill behind gold icons and the plan badge) | gold at 15% | gold at 12% |
| danger | `#E5635F` | `#D64545` |

Light is not inverted dark: surfaces lift to white, the ink is the dark background color, gold is
deepened so it still passes on white.

## Type scale (Sora, loaded in the root layout; the splash stays up until it is ready)

| Role | Face | Size / line | Tracking |
|---|---|---|---|
| display | Sora Bold | 40 / 46 | −1 |
| title | Sora SemiBold | 28 / 34 | −0.6 |
| heading | Sora SemiBold | 20 / 26 | −0.3 |
| body | Sora Regular | 16 / 24 | 0 |
| label | Sora Medium | 15 / 20 | 0 |
| caption | Sora Regular | 13 / 18 | +0.1 |
| micro (tab bar labels only) | Sora Medium | 11 / 13 | +0.1 |
| numeral (the running clock) | Sora SemiBold | 64 / 72, tabular | −2.5 |
| stat (streaks, plan ratio) | Sora SemiBold | 28 / 34, tabular | −0.8 |

Every number that changes uses tabular figures (`numeral`, `stat`, or `fontVariant` on a label), so
the clock and the steppers do not jump. Large numerals cap Dynamic Type scaling (1.2–1.4×) so the
hero keeps its shape at XL.

## Signature interaction: hold to start, the ring answers

`src/features/fasting/HoldButton.tsx` + `FastingRing.tsx`.

- Starting a fast is a long press (650 ms, `useLongPressGesture` from gesture-handler). On touch-down
  a light haptic fires and a fill sweeps across the pill (`withTiming`, ease-out). Lift early and the
  fill springs back; nothing happens, so a fast is never started by accident. At 650 ms the gesture
  activates: success haptic, the fast is created, the ring springs from 0 to the elapsed fraction.
- The ring is SVG: a track, a wide low-opacity arc (the glow) and the elapsed arc on top, both driven
  by one shared value through `useAnimatedProps` on `strokeDashoffset`. Each one-second tick glides
  linearly for exactly a second, so the arc never stutters; a start, reset or plan change springs.
- Hour ticks sit outside the ring, one per hour of the goal (every sixth is heavier). Ticks the fast
  has passed light up in the accent.
- The goal marker at twelve o'clock is a plain dot while running. When the goal is reached the arc,
  the glow and the marker turn gold, the marker pops with a spring, and the centre label switches to
  "Goal reached". Phase labels are by time only ("Hour 12"); no physiology claims.
- Reduce Motion: the fill becomes a fade, the ring jumps to its value, no pop.

Other motion: the onboarding progress bar springs between steps; option rows and benefits enter
with a light `FadeInDown` spring; history rows enter staggered and re-layout with
`LinearTransition`; large titles on History and Settings collapse into a compact bar on scroll.

## Screens

- Onboarding: progress bar on top, back chevron, the real ring as the picture on every step. Step 2
  is a one-day ring whose filled share is the fasting part of 24 hours, changing with the answer; step 3 draws the 24-hour strip with the
  fasting stretch from the chosen hour; step 4 builds the plan line by line (about a second, real
  values) while the ring completes.
- Paywall: the ring in its gold state with the user's plan ("16:8", "16 hours, done"), four
  one-line benefit rows with SF Symbols, the plan cards pinned above the CTA (yearly pre-selected
  with the "Best value" badge, its per-week price and "save NN%" computed from the two prices), the
  CTA names the price, Restore · Terms · Privacy small below. No trial is configured, so there is no
  trial timeline (the research's pattern is no trial or 3 days).
- Timer: date and streak pill, the ring filling all the height between them and the facts (up to the
  screen width minus the gutters), two facts with a day line each (started / goal, or usual start /
  if you start now), the plan chips, the hold button with the alert hint under it.
- History: three stat cards, the seven-day chart (rounded bars, goal line, today in the accent),
  every fast as a row with a gold check when the goal was reached.
- Fast sheet (form sheet): plan chips, a full-width day stepper and hour / minute steppers side by
  side for start and end, a live duration card against the goal, Save, Delete.
- Settings: plan chips, grouped inset rows for reminders with a ±30 min start-time control, the base
  rows, reset data; development rows behind `__DEV__`.
- Empty state: a small SVG (quiet ring, crescent inside), one sentence, one action.

## Layout system (DESIGN.md 2b, by construction)

- Tokens: `spacing` is `xs 4 · sm 8 · ms 12 · md 16 · gutter 20 · lg 24 · xl 32 · xxl 48`. No raw
- `Screen`: safe areas, 20 pt gutter left and right, 16 pt top and bottom, and a pinned `footer`
  that sits 16 pt above the home-indicator inset (scrolling content ends above it).
- `Stack` / `Row` (`src/components/Stack.tsx`): children spaced by a token `gap`; siblings never
  carry margins. `fill` gives a row's text column `flex: 1` + `minWidth: 0`, so trailing values
  (prices, "Goal", switches) can never be pushed off screen.
- `Section`: caption title 12 pt above its content, optional right-hand action, optional grouped
  inset surface. Settings stacks sections 32 pt apart; the fast sheet 24 pt.
- `Card`: 16 pt padding. Chips: 16 pt horizontal. Buttons: 54 pt tall, 24 pt horizontal.
- Text that cannot break the layout: the clock, stats, prices and the steppers' values are one line
  with `adjustsFontSizeToFit`; list titles, dates and subtitles truncate; headlines cap at 3 lines.
- Tab screens: the tab bar is the opaque JS tab bar, so scroll content ends above it on its own;
  History and Settings add 32 pt at the end of the list rather than "tab bar + 24".

## Self-review, screen by screen (code read against DESIGN.md 2 and 2b)

- Onboarding (all four steps, one layout): progress row → hero area (`flexGrow: 1`, picture centred)
  → copy → options (12 pt apart, 64 pt min, selected state + haptic) → pinned CTA. The welcome ring
  is centred in the free space with the copy anchored above the button, so there is no top-stacked
  block. `flexGrow` rather than `flex` so a long step scrolls instead of squashing the ring. The plan
  step puts its copy between the ring and the plan rows; the rows have fixed slots, so the "building"
  second never moves anything. Back chevron 32 pt + 10 pt slop.
- Paywall: ring (184 pt) → headline (3 lines max) and sub → four benefits, all in one 24 pt `Stack`;
  footer `Stack` 12 pt apart: plan cards (72 pt min), CTA, footnote and links. The links are captions
  with a slop that makes each target 44 pt. The "Best value" badge is 12 × 4 pt: it is an inline
  label on the plan title, not a tappable chip, and 4 pt keeps the plan row at 72 pt.
- Timer: one 16 pt `Stack`: date/streak row (streak pill 32 pt, 12 pt horizontal, 8 pt icon gap) →
  hero (measures itself, ring = min(width − 40, height)) → facts `Row` (16 pt between columns, 8 pt
  label/value/day) → plan chips (gutter-aligned, the row scrolls to the screen edge on purpose).
  Footer heights are matched (the alert hint and the Settings link are both 44 pt) so the ring does
  not resize when the reminder is switched on. The ring centre stacks label, clock, caption 8 pt apart.
- History: large title → stat cards (`Row` stretch, equal widths, 8 pt inner stacks) → chart card
  (header row, 16 pt, chart; weekday labels sized to their text) → "All fasts" row with the log link
  → rows 12 pt apart (badge, text column with `fill`, trailing "Goal" / "2h short").
- Fast sheet: title row (title `flex: 1`, close 32 pt + 8 pt slop) → Plan section → Started → Ended
  → duration card, 24 pt apart; Save and Delete pinned.
- Settings: grouped inset rows through `Section`; list rows 52 pt min with 12 pt vertical padding,
  title one line, subtitle up to two; the start-time control's buttons are 32 pt + 6 pt slop.
- Empty state: illustration, title and sentence, action, 24 pt apart, centred as a hero block.
- Dark mode: both palettes are complete in `theme.ts`; no component branches on the scheme. Borders
  (`#262D4A` on `#151A2E`) stay visible; gold and its soft fill have their own dark and light values.

## Render-loop fix (TimerScreen)

The round-1 crash ("maximum update depth exceeded", reported at `TimerScreen` line 20) came from
`usePreferences()`: `useSyncExternalStore` called `preferences.get()`, which built a new object on
every call, so React saw a changed snapshot on every render and re-rendered forever. `get()` now
returns the cached snapshot until the saved values or the onboarding answers object change. The
other effects are stable: `useFasting`'s `refresh` is a `useCallback` with no deps (so
`useFocusEffect` runs once per focus), the tick interval depends only on `active`, and the hero's
`onLayout` sets a floored height that the ring then exactly fills (the hero is `flex: 1`, so the ring
onboarding → paywall → mock purchase → Timer → hold to start → History → Settings, light and dark,
no red screen.

## Critique rounds

### Round 1 (dark)

What a picky designer would say, and what changed:

- Welcome step: the picture and copy sat at the top with a third of the screen empty above the CTA.
  → Steps without options now centre picture and copy in the free space; the welcome ring is larger.
- Step 3: the 24-hour strip was a small pill floating in a big gap, with no sense of a day.
  → Full-width strip, taller, with hour ticks (heavier every six hours), moved down into the space.
- Step 4: the plan lines rendered in a narrow centred column and the title overlapped them as they
  arrived. → Lines stretch to the screen width; three fixed slots are reserved from the start (dim
  placeholders), so nothing below moves while the plan builds.
- Paywall: the plan cards were below the fold, hidden behind the CTA. → Plan cards moved into the
  pinned footer above the CTA; smaller ring, title-size headline, tighter benefits.
- Timer: crashed with "maximum update depth exceeded". → The preferences store returned a new object
  on every read; it now caches the snapshot until the saved values or the onboarding answers change.

### Round 2 (light + dark, after the hand-over)

Crash check first: the "maximum update depth exceeded" red screen from round 1 no longer happens.
Walked onboarding → paywall → mock purchase → Timer, started a fast with the long press, switched
tabs, loaded sample data, flipped to dark: no red screen. The cause was the preferences store
returning a new object on every read (now cached until the saved values or the answers change).

What a picky designer would say, and what changed:

- Gutters were 16 pt on some screens and 24 pt on others (timer facts). → One `spacing.gutter`
  (20 pt) used by `Screen`, the large title, the plan chips, History and Settings.
- Timer: a dead band between the ring and the facts; the ring was capped at 330 pt whatever the
  screen. → The ring measures its area and fills it (up to the width minus the gutters).
- Timer: "Hour 1", the clock and "to go" touched (1–3 pt). → The ring centre stacks with an 8 pt gap.
  The clock is one line and shrinks to fit instead of wrapping.
- Timer: "Started" and "Goal" touched each other; only one column had a day line. → 16 pt between
  columns, 8 pt between label and value, both columns show the day ("Today", "Tomorrow").
- Timer: the ghost button repeated the start time ("Started Today · 6:08 PM · edit"). → "Edit start
  time"; the time is already in the facts.
- Ring: the wide glow arc had round caps, which drew a blob at the start of the arc. → Butt caps on
  the glow, a little narrower and softer; the arc itself keeps its round ends.
- Onboarding step 2: picking an answer turned the ring gold, but gold means "goal reached". → The
  preview ring is one day: the fasting share of 24 hours fills in the accent ("16 of 24 hours").
  The ring is smaller so the last option no longer runs under the Continue button.
- Onboarding step 4: the "Your plan" title sat under the plan rows. → Ring, then title and copy,
  then the three plan rows.
- Welcome copy said "Hold the ring"; you hold the button. → "Hold to start a fast".
- Paywall: "Goal reached" in the ring clipped the stroke, and the fourth benefit ran under the
  pinned plan cards. → Larger ring with two lines ("16:8", "16 hours, done"); benefit details cut to
  one line each so all four fit above the footer; "Save NN%" pill gets 12 × 4 pt padding.
- History: stat icon, number and label touched; the weekday labels' frames abutted; the "goal 16h"
  label in the plot collided with the last bar. → 8 pt stacks, weekday labels sized to their text,
  the goal moved into the card header ("avg 16h 11m · goal 16h"). The duplicate "Log a past fast"
  button at the end of the list is gone (the header link stays).

## Visual QA (Nov 27, iPhone 17 Pro Max simulator)

Walked in light and dark: every onboarding step, the paywall, the mock purchase, hold-to-start, the
edit-start sheet (moved a fast to hour 12 and past the goal), history and settings with the sample
data. Fixed:

1. Ring labels collided with the ring on the small onboarding ring ("Pick one" / "Your plan" under
   the goal marker, "16 of 24 hours" across the arc). `FastingRing` now places its labels in a
   square inscribed in the hole (84% of the hole's diameter) and tightens their gap below 220 pt.
2. History had a double gutter (40 pt each side) and its title sat 16 pt lower than Settings':
   `content: { padding: 0 }` lost to the `paddingHorizontal` / `paddingVertical` Screen sets
   (React Native gives the specific key priority). Now it clears both explicitly.
3. Paywall: the fourth benefit sat under the pinned plans. Ring 184 → 152 pt with "ready" in the
   middle, subheadline cut to one line, the stray extra bottom padding removed. Everything fits
   above the plans.
4. Last-meal step: the "Eat 8 h" legend dot and the eating part of the strip were nearly invisible
   (track colour on the background). The dot has an outline and the strip a hairline border.
5. "How much have you fasted before?" left "before?" alone on a line; now "Have you fasted
   before?".

Kept: the native switch's off state is drawn by iOS 26 (light glass track in dark mode); audit lines
for the native tab bar, the protocol chips' horizontal scroller at the edge, and 4–5 pt between a
title and its detail line inside one row.
