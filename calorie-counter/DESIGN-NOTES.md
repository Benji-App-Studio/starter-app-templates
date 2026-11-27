# BiteCount design notes

Feel: clean and confident, black and white with one hot accent (references for taste only: Cal AI,
Lose It). The accent is used for the calorie ring, the primary button, selection and today; the
rest of the UI is ink on near-white.

## Palette (`src/theme/theme.ts`)

| Token | Light | Dark | Used for |
|---|---|---|---|
| background | `#FAFAF8` | `#111110` | screens |
| surface | `#FFFFFF` | `#1C1C1A` | cards, rows, sheets |
| border | `#E9E9E4` | `#2B2B28` | hairlines, ring tracks |
| text (ink) | `#0E0E0E` | `#F2F2EE` | copy, selected states, chart bars |
| textMuted | `#7A7A75` | `#9A9A93` | captions, labels |
| primary (accent) | `#E0532F` | `#E0532F` | calorie ring, CTA, today |
| primarySoft | accent at 10% | accent at 20% | add buttons, today's cell |
| protein / carbs / fat | `#2F7DE0` / `#E3A72F` / `#36A26A` | `#5C9AE6` / `#E8B957` / `#4FB57F` | macro rings and legend |
| danger | `#D9342B` | `#E5675E` | over target, delete |

Dark is not inverted light: surfaces are lifted a step above the background and the macro colors
are lightened so they keep contrast on dark grey.

## Type scale (Plus Jakarta Sans)

| Style | Size / line | Weight | Letter spacing |
|---|---|---|---|
| display | 40 / 46 | 800 | −1.2 |
| title | 28 / 34 | 700 | −0.7 |
| heading | 20 / 26 | 600 | −0.3 |
| body | 16 / 23 | 400 | 0 |
| label | 15 / 20 | 600 | 0 |
| caption | 13 / 18 | 500 | 0 |
| overline | 12 / 16 | 600 | +0.6, section titles in capitals |
| micro | 11 / 14 | 600 | 0, tabular (tab labels, week-strip day numbers) |
| numeral | 64 / 68 | 800 | −2.5, tabular |
| stat | 22 / 26 | 700 | −0.5, tabular |

Inside a ring the numeral is sized from the ring's inner hole by `ringNumeralStyle(size)` in
`CalorieRing.tsx` (29% of the hole: about 60 pt in the 300 pt hero, 47 pt in the 220 pt plan ring,
35 pt on the 176 pt paywall ring), so a four-digit number with its comma never touches the inner
ring at any size. Every number that changes uses tabular figures.

## Spacing and layout primitives

`theme.spacing` is the only source of spacing: 4, 8, 12 (`ms`), 16, 20 (`gutter`), 24, 32, 48.

- `Screen`: safe areas, 20 pt gutter left and right, optional collapsing large title, scroll
  content ending 24 pt above whatever is pinned below it, and `footer` as the bottom CTA slot
  (8 pt above it, 16 pt below it to the home-indicator inset).
- `Stack` / `Row`: vertical and horizontal groups with a token `gap`. Siblings are spaced only by
  gaps; no child in a screen sets its own margin (the only margin left is inside `Screen`'s large
  title, which is the primitive itself).
- `Section`: an overline title 12 pt above its content, optionally one grouped surface;
  screens space sections with `Stack gap="xl"` (32 pt).
- `Card`: 16 pt padding. Primary `Button`: 56 pt tall, 24 pt horizontal padding. The savings pill:
  12 pt horizontal, 8 pt vertical.
- Row text containers have `flex: 1` and `minWidth: 0`; food names and plan titles are one line
  with an ellipsis; stats and macro grams are `numberOfLines={1}` with `adjustsFontSizeToFit`.

## Signature interaction

The calories-left ring with three macro rings that animate on each log, plus a week strip with a
tiny ring per day.

- `CalorieRing` (`src/features/diary/CalorieRing.tsx`): four SVG circles; each progress arc is an
  `Animated.createAnimatedComponent(Circle)` whose `strokeDashoffset` is driven by a reanimated
  shared value with `withSpring` (damping 18, stiffness 110). Stroke widths scale with the ring
  size so the same component serves the 300 pt hero, the 200 pt onboarding preview and the 176 pt
  paywall ring. A zero-length dash with round caps still draws a dot, so the arc's opacity is 0
  until there is progress. With Reduce Motion on, the arcs use a 200 ms `withTiming` instead.
- `AnimatedNumber` (`src/components/AnimatedNumber.tsx`): the number in the middle counts to its
  new value through a read-only `TextInput` with `animatedProps`, so it updates on the UI thread.
- The log sheet commits with `Haptics.notificationAsync(Success)`, then closes; Today refreshes on
  focus and the rings spring from the old value to the new one.
- `WeekStrip`: seven 38 pt rings (Monday to Sunday), today filled with the soft accent, future
  days at 35% and not tappable, past days open the day detail with a selection haptic.
- Meal rows enter with `FadeInDown.springify()` and reflow with `LinearTransition`; swipe left
  (`ReanimatedSwipeable`) reveals delete.
- Onboarding: the ring previews the target as the user picks an answer (the number springs from
  2,000 to 1,500 when "Lose weight" is chosen), and the last step fills the ring to 100% during a
  1.3 s "Building your plan" moment before the macro split appears.

## Review rounds

### Round 1 (first load, iPhone 17 Pro Max, light and dark)

What a picky designer would say, and what changed:

1. Welcome ring too small (210 pt) with an empty lower half; caption "kcal a day, for example"
   overflowed the ring's hole. → Welcome ring now sizes to the screen (up to 300 pt), the welcome
   block is vertically centred with the display style, and the caption is "kcal a day".
2. Plan reveal top-aligned with dead space below. → Centred vertically, ring 240 pt.
3. Paywall: 168 pt ring left a 74 pt hole, so "kcal a day" sat on the inner ring; the content ran
   under the pinned CTA on a Pro Max. → Ring strokes now scale with size (hole ≈ 65% of the
   diameter), benefits shortened to one line, plan rows and gaps tightened, subheadline shortened.
4. SF Symbols were read as "text field, Infinity symbol" by VoiceOver. → `Icon` is hidden from
   accessibility; the adjacent text carries the meaning.
5. Today's empty state collided with the pinned "Log food" button and duplicated its action. →
   Compact empty state (88 pt plate, one line), the pinned button is the only action.
6. In the log sheet "Enter by hand" sat below the first detent, out of sight. → Moved under the
   search field, above the results.
7. History chart alternated weekday initials and day numbers under the bars. → Day numbers under
   every bar, today's in the accent and bold.
8. "Load sample data" gave no feedback. → A short alert when the twelve days have landed.



1. Welcome: centred, ring 300 pt, clean in the layout audit (no overlaps, touching or edge
   crowding). Kept.
2. Goal and activity steps: the ring previews 2,000 → 1,500 on "Lose weight"; selected rows read
   clearly (ink border + filled check). The copy block sat top-stacked with an empty band above
   the CTA. → Every step now uses one layout: the step body is a `Stack` that fills the space
   above the CTA and centres its content.
3. Plan step: the 60 pt numeral overflowed the inner ring of the 240 pt ring ("1,500" crossed the
   green ring). → Numerals are sized from the hole (`ringNumeralStyle`), the plan ring is 220 pt.
4. Plan step said "ready" but did not show where the number came from. → The card now shows the
   real sum: "Burned on a day like yours 2,000", "To lose steadily −500", "Your daily target
   1,500 kcal", then the protein / carbs / fat split in three columns. The 1.3 s building moment
   shows the same two numbers in one sentence.
5. Layout rules from DESIGN.md 2b applied across the code: 20 pt gutter (was 16), 12 pt between
   sibling rows and between a section title and its content (was 4), off-grid 2 and 3 pt gaps
   removed, CTA 56 pt, pill padding 12 / 8.
6. Unused native packages removed (`expo-audio`, `expo-blur`, `expo-linear-gradient`).

## Screen-by-screen self-review against DESIGN.md 2 and 2b

| Screen | Hero | Layout check |
|---|---|---|
| Onboarding welcome | 300 pt live ring, part-way day | Centred block above the CTA; display title max 3 lines; centred text is deliberate on the welcome and plan steps (hero screens), the question steps are left-aligned |
| Goal / activity | 200 pt ring previewing the target | Option rows 64 pt min, 16 pt padding, 12 pt apart, radio 24 pt; selection haptic; CTA disabled until a pick |
| Plan | 220 pt ring fills to 100% | Sum card 16 pt padding, 12 pt between lines, hairline dividers; macro columns equal width |
| Paywall | 176 pt ring in its finished state, personal target in the headline | Benefits 12 pt apart with 32 pt icon tiles; plan rows 60 pt min with 12 / 16 padding, yearly pre-selected with per-week price and "Save NN%"; trial timeline; footer CTA + footnote + Restore · Terms · Privacy; no close button |
| Today | Week strip of seven 38 pt rings, 300 pt calories-left ring with three macro rings | Sections 32 pt apart; ring and macro legend 24 pt apart; meal groups 24 pt apart, title 12 pt above its card; add buttons 28 pt with 8 pt hit slop (44 pt target); pinned "Log food" CTA |
| Log food sheet | Meal picker, live totals | Header, picker and content 24 pt apart; result rows 56 pt min with one-line names; by-hand form fields 8 pt apart in a three-column macro row |
| History | Two-week bar chart (hand-drawn SVG, today in the accent, dashed target line) | Chart width measured from the screen minus gutters and card padding; stats in three equal columns; "Days" section grouped list |
| Day detail | 220 pt ring for that day | Header, hero and list stacked with token gaps; pinned "Log food for this day" |
| Settings | Grouped inset rows | Sections 32 pt apart, titles 12 pt above; every base row kept (Theme, Status, Restore, Manage, Terms, Privacy, Rate, Contact, Version) plus daily target stepper, macro split, delete all food logs; development-only sample data and reset |

Dark mode: every color comes from the theme; dark lifts surfaces (`#1C1C1A` on `#111110`), keeps
hairlines visible (`#2B2B28`) and lightens the macro colors. Not re-checked on the simulator after

## Visual QA (Nov 27, iPhone 17 Pro Max simulator)

Every screen walked on the simulator in light and dark, with the layout audit on each. Fixed:

1. Paywall: the trial timeline was cut off by the pinned CTA on first view (its captions sat under
   the button until you scrolled). Ring 176 → 144 pt, subheadline shortened to one line ("Log a
   meal in seconds. The ring keeps you honest.", no orphan "day."), timeline captions shortened to
   "Full access" / "Last free day" / "$39.99 billed" so each fits one line. The whole paywall now
   fits above the CTA on a Pro Max.
2. Today, empty: the stacked empty state ("Nothing logged yet") was half hidden behind the "Log
   food" CTA. `EmptyState` gained an `inline` layout (drawing beside the copy); Today uses it, so
   the empty state sits fully visible under the macro legend.
3. Log food sheet: the live totals floated as a centred cluster under the card with mismatched
   baselines. They now sit inside the card under a hairline, in four equal columns aligned to the
   bottom so the captions share a line.
4. History chart: past days over target were drawn in red, nearly the same as today's accent bar.
   Past bars are now ink, and only the part above the target line turns red (SVG clip), so today
   is the one accent bar.
5. Settings: the third theme swatch (surface colour) was invisible on the white card. Swatches
   now carry a 1 pt muted border.
6. Activity step subtitle wrapped with an orphan word; now "Movement counts, even before any
   workout."

Audit lines kept on purpose: the native tab bar (EDGE/HOME/touching between tab buttons), the
week-strip day buttons 4 pt apart (each is a 38 pt ring in its own equal slot, so the rings read
spaced), the hidden swipe-to-delete buttons behind meal rows, and 4–5 pt between a label and its
value (one text block, inside the 4–8 pt rule for related lines).
