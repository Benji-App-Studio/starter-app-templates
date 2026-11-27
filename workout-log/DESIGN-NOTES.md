# Setlog design notes

Dense, serious, gym-floor. The app is dark-first (most lifters log under gym lighting with the
phone on a bench), with a designed light theme. One warm accent, amber, for the hero, the primary
action and selection; a red reserved for personal records. Everything else is neutral.

construction (tokens, layout primitives, fit-to-width numbers) and reviewed screen by screen below.

## Palette (`src/theme/theme.ts`)

| Role | Dark (default) | Light | Use |
|---|---|---|---|
| background | `#0F1012` | `#F3F3F0` | screens, tab bar |
| surface | `#1A1C20` | `#FFFFFF` | cards, groups, sheets |
| surfaceRaised | `#25282E` | `#ECECE8` | stepper fields, chips, tracks |
| border | `#2C2F36` | `#E0E0DB` | hairlines, card borders (no shadows anywhere) |
| text | `#F2F2F0` | `#0F1012` | |
| textMuted | `#8E9096` | `#6B6E75` | captions, labels, inactive tabs |
| primary | `#F2A93B` | `#F2A93B` | hero fills, primary button, checked sets, selection |
| primarySoft | amber 16 % | amber 20 % | checked set rows, selected options, benefit tiles |
| accentText | `#F2A93B` | amber darkened 42 % | accent used as text on the background (AA in light) |
| pr / onPr | `#E5484D` / white | `#D13438` / white | PR badges, record numbers |
| scrim | black 60 % | ink 40 % | behind modal sheets |

Dark is not inverted light: surfaces step up in lightness (`0F → 1A → 25`), the red is slightly
softer, and the light theme darkens the accent for text so amber never sits on off-white as text.

## Type (Barlow Condensed + Barlow, loaded in `app/_layout.tsx`, splash held until loaded)

| Variant | Face | Size / line | Use |
|---|---|---|---|
| numeral | Condensed Bold | 84 / 84, −2.5 | week count, rest clock, volume, heaviest set |
| numeralMedium | Condensed Bold | 44 / 46 | secondary hero numbers |
| numeralSmall | Condensed SemiBold | 26 / 30 | stats, set numbers, prices |
| stepper | Condensed Bold | 21 / 24 | the number in a set-table field |
| display | Condensed Bold | 44 / 46 | paywall headline, "Up next" routine |
| title | Condensed Bold | 32 / 34 | large screen titles, onboarding titles |
| heading | Condensed SemiBold | 22 / 26 | exercise and routine names, buttons |
| body / label / caption | Barlow 400 / 600 / 500 | 17 / 15 / 13 | copy, row titles, meta lines |
| overline | Barlow SemiBold, caps | 12 / 16, +1.1 | section titles, stat labels |
| badge | Condensed Bold, caps | 13 / 16 | PR, Save NN %, Best value |

All number variants use tabular figures and, through `Text`, `numberOfLines={1}` +
`adjustsFontSizeToFit` (min scale 0.5), so a number shrinks instead of wrapping or pushing a
neighbour. Hero sizes cap Dynamic Type at 1.3×; everything else grows to 2×.

## Layout system

- Spacing scale: 4, 8, 12, 16, 20 (gutter), 24, 32, 48, plus 12 × 6 for chips. No raw numbers in
- `Screen`: safe areas, 20 pt gutter, large title that fades into the compact bar on scroll, a
  pinned `footer` 16 pt above the home indicator with the content scrolling behind it, and
  `tabBar` for tab screens (24 pt under the last item; the scene already ends at the tab bar).
- `Stack` / `Row` / `Fill` / `Section` / `Group` / `Badge` in `src/components/Layout.tsx`. Sibling
  spacing always comes from `gap`. `Fill` is the text column of a row (`flex: 1`, `minWidth: 0`) so
  trailing values never get pushed off. `Section` puts its title 12 pt above the content; screens
  separate sections by 32 pt. `Group` is the inset list with hairlines between rows.
- Cards and sheets pad 16–20 pt; primary buttons are 54 pt tall with 24 pt side padding; small
  buttons 44 pt. List titles truncate to one line; headlines cap at 2–3 lines.

## Signature interaction: the live set table

`src/features/workout/ActiveWorkoutScreen.tsx`, `SetRow.tsx`, `src/components/Scrubber.tsx`,
`RestTimerSheet.tsx`, `useRestTimer.ts`.

1. Each exercise shows last session's sets under its name ("Last time 80 × 8, 80 × 8, 80 × 6") and
   its best weight in red. The fields show last session's numbers faintly as placeholders.
2. Weight and reps are steppers: − / + for one step (2.5 kg or 5 lb, one rep), tap to type, or drag
   horizontally anywhere on the field to scrub. The drag is a gesture-handler pan (activates after
   10 pt horizontal, fails on vertical so the list still scrolls); every 14 pt is one step with a
   selection haptic, and the field springs up 4 % with an amber border while held.
3. The check is the commit moment: blanks fill from last time, the row tints amber, the check
   button pops with a spring sequence (1 → 1.18 → 1), and a heavy impact haptic lands (the success
   pattern instead when the set is a record).
4. A record swaps the set number for a red PR badge that springs in (`ZoomIn`, low damping). The
   live rule is the same as the one stored at finish: the heaviest completed set of the exercise
   today, when it beats every earlier finished set; the badge moves if a later set is heavier.
5. The rest-timer sheet slides up on a spring (`Sheet`, reanimated + gesture-handler; swipe down to
   dismiss). It is undimmed and translucent so the table stays usable behind it. The 84 pt clock
   counts down from a wall-clock end time, the 8 pt bar drains linearly in real time (a clock, so
   linear is correct), −15 s / +15 s adjust it, and at zero it turns amber with "Go" and a success
   haptic. While it is up, the table gets extra bottom padding so the last set scrolls above it.
6. A live header (time, sets done / planned, volume so far, progress bar) answers "how far in am I".

Reduce Motion: every entering/layout animation, the pop, the sheet and the bars fall back to
fades or instant values (`useReducedMotion`).

## Screen-by-screen self-review (against DESIGN.md 2 and 2b)

- **Onboarding (4 steps)**: one layout component. Progress bar + "n of 4" on top, hero area
  `flex: 1` centred (min 30 % of the height), copy and choices under it, button pinned. Welcome
  hero is a slice of the real set table (rows land, PR badge pops, the rest bar drains once), so
  the first screen shows the product. Experience → the split's routines re-render live as chips;
  days → the week ring fills to the goal. Option rows are 64 pt, radio + amber-soft selected
  state, selection haptic. "Your plan": 1.2 s build while the starter routines are really written
  to SQLite ("Writing 3 routines for Push / Pull / Legs…"), then the ring fills segment by segment
  and five computed rows land (split, routines, exercises and sets, weekly goal, rest timer).
- **Paywall**: top third is the week ring in its success state at the chosen goal with "Your Push /
  Pull / Legs plan is ready"; headline (2 lines max), 4 SF Symbol benefit rows, plan cards with
  radio, per-week price and "Save NN %" computed from the store prices (or "Best value"), CTA that
  says what happens ("Start logging for $29.99 a year"), footnote, Restore · Terms · Privacy at
  44 pt targets. No close button. No trial timeline because the niche sells without a trial.
- **Week (Home)**: week ring hero at 68 % of the width (max 280), status line ("2 to go · Pull is up
  next"), resume card when a workout is in progress, routine cards with the "up next" one marked in
  amber, empty workout. Empty: rack illustration + one line.
- **Routines**: "Up next" hero card (display name, meta, full-width Start), then the list. Empty
  state centred with one action.
- **Routine editor**: big condensed name field, exercise cards with index, remove (44 pt) and a sets
  stepper, pinned "Add exercises", delete at the end.
- **Exercise picker** (form sheet): search, "Create “name”" dashed row, muscle sections as inset
  groups with round checks, pinned "Add n exercises".
- **Active workout**: see above. Columns are fixed (set 40, check 44) with two equal flexible
  fields, so the table aligns across exercises; header columns use the same widths and padding.
- **Workout summary**: volume count-up hero, four equal stat columns, a red-bordered records card,
  every exercise as a group of set rows with PR badges, delete at the end.
- **History**: Workouts / Records segmented control. Workouts: this week's volume hero, hand-drawn
  8-week bar chart (dashed top gridline labelled with the max, this week in amber), session cards.
  Records: count hero, latest record line, record cards with the weight in red. Designed empty
  states for both.
- **Exercise detail**: heaviest set hero in red, three stats, smooth line chart of the top set per
  session (labels sit on the gridlines, never on the line), the session log. Empty state when the
  exercise has never been logged.
- **Settings**: inset groups (Training, Appearance, Subscription, About, Data, Development in dev
  builds only) with every base row kept, plus units, rest timer, weekly goal and delete workouts.
- **Dark mode**: borders are `#2C2F36` on `#1A1C20` and stay visible; amber on near-black is the
  default look; light mode darkens the accent for text.

## Deliberate exceptions

- Stepper − / + targets are 28 × 44 pt, under the 44 × 44 guideline, so two of them and a weight
  like "102.5" fit a set row on a 375 pt phone. The whole field is also a drag and tap target.
- The PR badge replaces the set number inside the 40 pt set column instead of having 12 pt side
  padding of its own; at 40 pt wide the "PR" label still has about 13 pt either side.
- The rest-timer sheet is translucent and does not dim the screen, so the set table stays usable
  while resting.

## Earlier pass

The previous session's work was kept (data layer, routes, set table, rest timer, charts). This
pass replaced every raw spacing, color and font value with tokens, added the layout primitives,
rebuilt onboarding on a balanced layout with the set-table hero, removed the cramped "Prev"
column in favour of the "Last time" line and placeholders, fixed the PR rule to match the stored
one, redesigned the rest sheet, and redrew the icon (the plates were loaded in the wrong order).

## Visual QA (Nov 27, iPhone 17 Pro Max simulator)

Walked in light and dark: every onboarding step, the paywall, the mock purchase, a live workout
(stepped and scrubbed the weight, checked a set: PR badge and the draining rest sheet), the saved
workout, routines, history, records and settings with the sample data. Fixed:

1. Paywall: both plans were under the pinned CTA on first view. Week ring 220 → 150 pt, three
   benefits with one-line details, subheadline one line ("Every set, rest and record, kept on this
   phone."), section gaps one step tighter. Plans now sit above the CTA in light and dark.
2. Onboarding question steps: the fourth option ("Three years or more") was under Continue. The
   hero's minimum height is 20% of the screen on question steps (30% on the others).
3. Volume numbers read "22135" and "11560": `toLocaleString` came back ungrouped on device. They
   are grouped by hand now, with a comma (a thin space vanished in the condensed numerals):
   "22,075", "11,560".
4. History rows said "1 sets"; now "1 set".
5. Settings: the third theme swatch (surface colour) was barely visible on the card in light and
   invisible in dark; swatches have a 1 pt muted border.

6. PR on a first-ever set (code fix, Nov 27): the first time an exercise is logged it now sets the
   baseline silently; a PR needs an earlier best to beat. The live badge, the check-off haptic and the
   saved `is_pr` all use `findPersonalRecords` in `src/db/workoutSets.ts`.

Kept: audit lines for the
native tab bar, the workout header's close/finish row sitting directly over the title, numeral +
unit pairs ("60" "kg", 4 pt), and the history chart's week labels sharing equal columns.
