# Design notes — Tallyo (expense-tracker)

Feel: calm, editorial, adult. The money is the picture; everything else is quiet.

## Palette (`src/theme/theme.ts`)

| Token | Light | Dark | Used for |
|---|---|---|---|
| background | `#F6F4EE` | `#121715` | screens |
| surface | `#FFFFFF` | `#1B231F` | cards, sheets, settings groups |
| border | `#E7E3D9` | `#2C362F` | hairlines, card outlines |
| track | `#EAE7DE` | `#28322C` | empty part of bars |
| text (ink) | `#14211D` | `#EEF1EC` | |
| textMuted | `#6E7A74` | `#98A49D` | captions, sublines |
| primary (accent) | `#1F6F5F` | `#4FA68F` | the hero fill, the one primary button, selection |
| danger (accent-2) | `#D9573B` | `#E8846A` | over budget, delete |
| categoryTints | 8 muted mid-tones (amber, sage, steel, rose, slate, olive, teal, stone) | lifted versions | category badges, budget ring, meters |

Dark is designed, not inverted: surfaces lift above the background, the accent is lighter and less
saturated so it keeps AA contrast on dark surfaces, tints are lifted one step.

## Type scale

DM Serif Display for every amount and screen title, DM Sans for everything that is read. All styles
live in `theme.typography`; no component sets a font size, family or tracking itself.

| Style | Face | Size / line | Notes |
|---|---|---|---|
| numeral | Serif | 88 / 96, −3 tracking | the Today hero; tabular figures; shrinks to fit, never wraps |
| numeralSheet | Serif | 64 / 72 | the amount being typed on the keypad sheets |
| numeralCompact | Serif | 56 / 62 | the hero inside the onboarding and paywall previews |
| display | Serif | 40 / 46 | welcome and paywall headlines, Budgets ring centre, Report amount |
| title | Serif | 32 / 38 | large screen titles (collapse into a 15 pt label on scroll) |
| money | Serif | 22 / 28 | amounts in rows |
| heading | Sans 600 | 20 / 26 | section headings, sheet titles |
| body | Sans 400 | 17 / 24 | |
| label | Sans 600 | 15 / 20 | buttons, chips, option rows |
| caption | Sans 500 | 13 / 18 | sublines, axes |
| eyebrow | Sans 600 | 12 / 16, +1.2 tracking | upper-case labels above a number or a settings group |
| key | Sans 500 | 26 / 32 | keypad digits |
| input / tab | Sans | 16 / 22 · 11 / 14 | the note field · tab bar labels |

Dynamic Type: every style scales, with a cap per role (numerals 1.15×, body 1.8×) so the hero never
wraps and lists stay readable at XL.


The app was finished without a simulator, so the code makes bad layout hard to write:

- `theme.spacing` is the 8-pt grid: hairline 2, xs 4, pillY 6, sm 8, item 12, md 16, gutter 20,
  lg 24, xl 32, xxl 48, xxxl 64. `theme.sizes` holds fixed control heights (hit 44, key 56,
- `Screen` owns the safe areas, the 20 pt gutter, the large title, the pinned bottom CTA (16 pt above
  the home indicator, content scrolls behind it) and the bottom breathing room on tab screens.
- `Stack` and `Row` (in `src/components/Layout.tsx`) space siblings with `gap` from the grid. Screens
  that were rewritten in this pass (Today, Budgets, Report, Paywall, Onboarding, Settings, both
  sheets) no longer put margins on children.
- Every row text block is `flex: 1, minWidth: 0` with `numberOfLines`, so a long note or category
  name truncates and the amount on the right stays put. Every number that can grow uses
  `numberOfLines={1}` + `adjustsFontSizeToFit` + `minimumFontScale`.

## Signature interaction

"Left today": the daily allowance (what is left this month ÷ days left, today included) in an 88 pt
serif numeral over the month runway.

The runway (`DayRunway.tsx`) is one rounded column per day of the budget month, drawn in
`react-native-svg`. Past days fill from the bottom with what they cost (accent; a day over the daily
plan fills in the over-budget orange), today's column is outlined in ink with a "Today" label under
it, future days are faint tracks, and a dashed line marks the daily plan (budget ÷ days). The scale
keeps the plan at half height at most so a heavy day visibly pokes above it. The edge labels ("Nov 1",
"Nov 30") hide when the Today label would collide with them.

Adding an expense opens a form sheet (`presentation: 'formSheet'`, fit to contents, grabber) with an
in-app keypad, so the system keyboard never pushes the sheet around. Each key dips to 0.92 on touch
and springs back (reanimated `withSpring`), with a light haptic; long-press on delete clears the
amount. Save gives a success haptic. Back on Today, `AnimatedMoney` springs the numeral from the old
allowance to the new one, and today's column grows with a spring (`useAnimatedProps` on the SVG rect,
slight overshoot). With Reduce Motion on, keys do not scale and numbers and columns jump.

How it is built:

- `AllowanceHero.tsx` composes the eyebrow, `AnimatedMoney`, the subline (what is left this month and
  how far under or over plan you are) and `DayRunway`; `usePeriodSummary` provides `spentByDay`.
- `AnimatedMoney` keeps a shared value; `useAnimatedReaction` rounds it and pushes it to React state
  (`runOnJS`), so `Intl` formatting never runs on the UI thread.
- The same hero, compact, is the live preview in onboarding (it re-computes as each option is
  highlighted) and the "your daily number" card at the top of the paywall.

Other hero elements: Budgets has a category ring (`CategoryRing.tsx`): each category owns an arc as
long as its limit, drawn faint, filled with what it spent, orange past its limit; the month's spend
sits in the middle in serif. Report has six months of rounded bars against a dashed budget line
with the selected month's amount above it in serif and a legend under the axis.

Other motion: list rows enter with `FadeInDown.springify()`, meters and chart bars spring to length,
the onboarding progress bar springs one step at a time, the plan lines appear ~340 ms apart (four
lines, about 1.4 s). Nothing moves without an action.

## Structure

- Today, Budgets, Report, Settings tabs (JS tabs, SF Symbols on iOS via one `Icon` component).
- Large serif titles that scroll away under a compact bar (`Screen title=`).
- Two form sheets: add/edit expense, category limit.
- Onboarding: thin top progress bar. The welcome step lets the illustration own the space above and
  sets the display headline just above the CTA; question steps show the live hero preview and large
  radio rows with a haptic tick; the last step builds "Your plan" line by line from real values.
- Paywall: the plan hero on top, four benefit rows with symbols, two plan cards with per-week price
  and the computed saving on yearly, a trial timeline (Today · Day 5 still free to cancel · Day 7
  billed), one CTA that says what happens, Restore · Terms · Privacy as 44 pt targets. No close.
- Empty states: a small SVG in the palette, one sentence, one text action.
- Settings: grouped inset rows with hairline dividers; Theme is a System / Light / Dark choice that
  calls `Appearance.setColorScheme`, so native sheets and alerts follow it too.

## Rounds

The first agent planned screenshot rounds but stopped before taking any. The owner then switched
line-by-line read of every screen against DESIGN.md sections 2 and 2b.

What changed in this pass, against what was found:

1. The Today hero was a 76 pt number over a 14 pt progress bar (about a quarter of the screen). It is
   now an 88 pt number over a 120 pt day-by-day runway that reacts to every log: about 45% of the
   first screen, and it tells you which days went over.
2. Budgets was a number, a thin stacked bar and eight identical bordered cards. It now has a ring
   hero and one grouped list with dividers.
3. Layout rules: 20 pt gutter everywhere (was 16), cards 20 pt inside, pill badges 12 × 6, every
   control ≥ 44 pt, every lint finding fixed at the source (16 found), sibling spacing via `gap`.
4. Keypad keys got a spring press; the Theme row became a real choice; the paywall stopped promising
   a trial reminder the app does not send; the Report "Budget" label no longer sits on top of the
   current month's bar (moved to a legend).
5. Removed the unused `expo-audio`, `expo-asset`, `expo-blur` and `expo-linear-gradient`.

## Screen-by-screen self-review

| Screen | Hero | Layout check (2b) | Notes |
|---|---|---|---|
| Onboarding welcome | Ledger illustration centred in the flexible space | Gutter 20; copy anchored above the CTA, no dead lower half | Display headline max 3 lines |
| Onboarding questions | Live compact hero in a 20 pt card | Options 60 pt tall, 12 pt apart, radio 24 pt on a shared centre line | Haptic tick on pick |
| Onboarding plan | Compact hero + four computed lines | Lines 8 pt apart, check bubble aligned to the first text line | CTA enabled after the last line |
| Paywall | Compact hero with the user's numbers | Sections 32 pt apart; plan cards 16 pt inside; badge 12 × 6; links 44 pt tall | Hard paywall, no close |
| Today | 88 pt numeral + day runway | Footer CTA pinned above the tab bar; list rows truncate the note, amount fixed right | Empty state when nothing logged |
| Add / edit expense | 64 pt typed amount | Sheet 20 pt sides; chip strip scrolls edge to edge with 20 pt inset; keys 56 pt, 8 pt apart | Delete in the header when editing |
| Budgets | Category ring, serif spend in the middle | Ring max 280 pt, centred; rows in one group, 16 pt inside, hairline dividers | Tap a row to edit the limit |
| Category limit | 64 pt limit | Same sheet rules as add expense | Remove limit in the header |
| Report | Serif month amount + six bars | Chart width measured; legend 12 pt under the axis; breakdown rows truncate names | Empty state before the first log |
| Settings | (list screen) | Grouped inset rows, eyebrow titles 12 pt above, 32 pt between groups | Dev rows only in `__DEV__` |

Not verified on a device in this pass (owner runs the app): Dynamic Type at XL on the sheets, and
the exact height of the add sheet on a 4.7" phone (the sheet is about 670 pt tall; on the
smallest phones the form sheet uses its large detent and stays usable).

Kept on purpose: the today outline in the runway is a deliberate layer over its own column; the
ring's centre content is inset by two stroke widths rather than a spacing token because it follows
the ring geometry.

## Visual QA (Nov 27, iPhone 17 Pro Max simulator)

Walked every screen in light and dark, added an expense on the keypad, loaded the sample data.
Fixed:

1. Add-expense sheet (the signature flow): the category strip was drawn at the top of the form
   sheet, over the "New expense" header and close button, and ran off the right edge. In a
   `fitToContents` form sheet the native sheet took the horizontal ScrollView over (switching off
   inset adjustment and `sheetExpandsWhenScrolledToEdge` did not help). The eight categories are
   now a wrapped row of chips, always visible, no scrolling.
2. First month: a user who finished onboarding on Nov 27 saw the whole $2,750 spread over four
   days ("$687.50 left today", "$2,432.50 under plan"). Onboarding now records `startedAt`; Today
   prorates the budget to the days from the start (`firstDayIndex` on `AllowanceHero`), so day one
   reads $91.66 and $366.67 over 4 days, with the daily plan and pace from the same base. Sample
   data clears `startedAt` (it covers whole months).
3. Onboarding preview: the runway said "Today … Nov 30" under a "day one" number for a 30-day
   month. It now says "Day 1 … Day 30". The compact runway is 48 pt (was 72) and the card padding
   16 pt, so all four options fit above Continue (the fourth was under the button).
4. Paywall: the plans and the trial timeline were a screen below the CTA. The paywall card shows
   the number without the runway, three one-line benefits, tighter gaps; everything fits above
   the CTA in light and dark.
5. Plan step: "Building your plan…" sat under the lines and the line sliding in passed over it; the
   caption now sits above the lines (and reads "Built from your answers" when done).
6. Today, empty: the empty card's own "Add your first expense" link sat under the pinned "Add
   expense" button; the card has no action now.
7. Welcome title "Know what is left to spend" left "spend" alone; now "One number a day".

8. First month on Budgets and Report (code fix, Nov 27): both used the full monthly budget while
   Today prorated it. `periodBudget` (budgetPlan.ts) now prorates the total and every category limit
   for the starting month inside `usePeriodSummary`, so Today, the Budgets ring/rows/subtitle and the
   Report budget line and under/over text read one number; the editor and Settings keep the monthly
   limits, and later months are unchanged.

Audit lines kept: the native tab bar; eyebrow over numeral pairs (one hero block, 4–5 pt is the
type's own line gap); the report's month buttons sharing edges (equal columns of one chart).
