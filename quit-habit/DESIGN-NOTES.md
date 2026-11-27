# Clearstreak — design notes

Feel: calm, encouraging, clear. The counter is the product, so it is the one loud thing on the
screen; everything else is quiet, neutral and set in one typeface.

## Palette (`src/theme/theme.ts`)

| Token | Light | Dark | Used for |
|---|---|---|---|
| background | `#F4F7F5` | `#0E1512` | every screen |
| surface | `#FFFFFF` | `#172019` | panels, rows, the ring's inner disc |
| surfaceAlt | `#EDF2EF` | `#1F2B23` | the ring's track, secondary buttons, stepper wells |
| border | `#DDE5E0` | `#2A3830` | hairlines, unselected outlines, locked milestones |
| text (ink) | `#12251D` | `#EEF4F0` | |
| textMuted | `#6D7F77` | `#93A49B` | captions, the clock under the hero number |
| primary (accent) | `#0F8A5F` | `#3DAE87` | the ring's arc, the primary button, selection, "Smoke-free" |
| primarySoft | primary at 10% | primary at 20% | selected rows, icon wells |
| accent (milestone gold) | `#E8B04B` | `#E9BC64` | reached/next milestones, the marker at the top of the ring, "Save NN%" |
| danger / dangerSoft | `#C4553F` | `#E07A66` | the hold-to-reset button and destructive rows only |
| onAccent | `#3A2A08` | `#2A1E05` | ink on the gold "Save NN%" badge |

Dark is designed, not inverted: surfaces lift two steps above the background, the green is lighter
and less saturated so it still reads on dark, and the gold warms up slightly.

## Type (Manrope, loaded in `app/_layout.tsx`; the splash stays up until it is in)

| Style | Size / line | Weight | Use |
|---|---|---|---|
| numeral | 88 / 92, letter-spacing −4, tabular | 800 | the days (or hours) in the ring, the previews in onboarding |
| numeralSmall | 28 / 34, letter-spacing −1, tabular | 700 | hh:mm:ss, the breathing countdown |
| display | 36 / 42 | 800 | "Day 1" on the paywall, "30" on the plan step |
| title | 28 / 34 | 700 | screen titles |
| heading | 20 / 26 | 700 | section titles, prices |
| body | 16 / 24 | 400 | |
| label | 15 / 20 | 600 | buttons, row titles, stat values |
| caption | 13 / 18 | 500 | dates, hints, axis labels |
| overline | 11 / 14, letter-spacing 1.2 | 700 | "SMOKE-FREE", group titles, the Save badge |
| tabLabel | 11 / 13 | 600 | tab bar labels |
| axis | 12 / 16 | 500 | chart values and weekday labels (inside SVG) |

Every number that changes in place has `fontVariant: ['tabular-nums']` so it never jumps sideways.

## Spacing and layout primitives

Spacing scale (`theme.spacing`, 8-pt grid): `xxs 2` (title to its caption), `xs 4`, `sm 8`
(icon to label), `item 12` (siblings in a list, section title to content), `md 16` (card padding),
`gutter 20` (screen sides), `lg 24`, `xl 32` (between sections), `xxl 48`.

Every screen is built from the same small set, so spacing cannot drift:

- `Screen`: top safe area, the 20 pt gutter, an optional large title that collapses into a compact
  bar, an optional pinned footer. Tab screens pass `tab`. Page-sheet modals pass `topInset={false}`.
- `BottomCTA` (used by `Screen`'s footer): 12 pt above, 16 pt above the home indicator, buttons
  4 pt apart (a primary and a ghost button read as one group).
- `Stack` / `Row`: spacing between siblings only through `gap` with a spacing key. No component sets
  a margin on a child (the one exception is the large title's 16 pt, inside `Screen`).
- `Section`: title 12 pt above its content; `group` (small caps over an inset list, Settings) or
  `heading` (History). Sections sit in a `Stack gap="xl"` (History) or `"lg"` (Settings).
- `Card`: 16 pt padding, 1.5 pt border so it still separates from the background in dark mode.


## Signature interactions and how they are built

- **Odometer counter** (`src/features/quit/Odometer.tsx`): each digit is a column of 0–9 drawn
  twice inside a clipped box; a Reanimated shared value moves the column with a spring
  (`damping 18, stiffness 170`). A decrease (9 → 0, 59 → 00) rolls forward into the second copy and
  snaps back silently once the spring settles, so the digits only ever roll one way. With Reduce
  Motion on, the value is set directly.
- **The ring** (`CounterRing.tsx`): an SVG circle with `strokeDasharray` equal to its circumference
  and an animated `strokeDashoffset` (`useAnimatedProps`), springing to the progress toward the next
  milestone. The gold dot at 12 o'clock is the next milestone; it fills in when the ring is complete
  (paywall, plan step).
- **Money counting up**: the whole Counter screen ticks once a second from one `useNow()` hook, so
  money and units move with the clock rather than on a timer of their own.
- **Milestone timeline** (`MilestoneTimeline.tsx`): each row draws its own half-segments above and
  below its node, so rows grow with Dynamic Type and the line stays continuous. The segment toward
  the next milestone fills with the run's progress (lower half of the last reached row, then the
  upper half of the next row); the next node is larger and gold, locked ones are hollow.
- **Plan build** (`PlanStep.tsx`): three checklist steps tick off 350 ms apart (about 1.4 s) while
  the ring above them fills step by step; then it turns complete (gold marker) and the first month
  appears, computed from the answers.
- **Craving button → breathing circle** (`BreathingCircle.tsx`): a filled SVG circle inside an
  `Animated.View` scaled with `withTiming` on a sine easing (4 s in, 4 s hold, 6 s out, four rounds);
  a light haptic marks each phase change and a success haptic ends the minute. Reduce Motion
  replaces the scale with an opacity change on the halo.
- **Hold to reset** (`SlipScreen.tsx`): a `useLongPressGesture` (1.2 s) from Gesture Handler v3;
  a fill bar tracks the hold with `withTiming`, springs back if the finger lifts early, and the
  reset commits with a warning haptic. A slip cannot happen from a stray tap.
- **Choice rows and plan cards** give a selection haptic; the Continue button a light impact;
  starting the counter and logging a passed craving a success notification.

## Structure

- Counter: no title; "Since …" and the ring share a hero block that takes the free height and
  centers itself; under it three equal tiles and the next-milestone card; the craving button and
  "I slipped" are pinned in the footer above the tab bar. The screen scrolls on small phones.
- Milestones, History and Settings use `Screen` with a large title that fades into a compact bar.
- Add/log flows: `start`, `habit` and `currency` are native form sheets sized to their content;
  `craving` and `slip` are page-sheet modals because they need the height.
- Empty states: a small SVG in the palette, a heading, one sentence, one full-width action,
  centered in the screen.


The owner asked for this round to be built without the simulator, so each screen was read against
the rules instead of shot. What was found and changed:

**Shared frame.** Before: 16 pt gutters, `SafeAreaView` padding plus a footer with its own 16 pt, so
the CTA sat flush on the home-indicator inset; `ScrollScreen` was a separate frame. After: one
`Screen` with 20 pt gutters, `BottomCTA` 16 pt above the inset, the large-title mode folded in,
tab screens get 24 pt under their last item (the JS tab bar sits below the scene, not over it).

**Onboarding.** Before: a top-stacked scroll column; the welcome step left the lower half of the
screen empty above Continue (seen on the simulator in the first round). After: one layout for all
five steps: progress bar, a hero area with `flexGrow: 1` that centers the live preview in the free
height, the copy and options under it, the pinned button. On the welcome step the copy now sits just
above the button with the ring centered above. The "TIME FREE" overline had touched the numeral; it
now has an 8 pt gap and the unit sits under the digits through a `Stack` instead of a −4 pt margin.
Plan step: the ring is now the hero and fills while the plan builds (real steps, 1.4 s), the
checklist turns into the plan card under the title.

**Paywall.** Spacing rebuilt with `Stack`s (24 pt hero to copy, 32 pt between blocks, 12 pt between
plan cards). The "Save NN%" badge used a raw hex and 2 pt padding; it now uses `onAccent` and 12/8
pt padding. Restore · Terms · Privacy are 44 pt tall targets. Plan cards are at least 72 pt, the
price never wraps. No trial timeline: the mock plans and default products have no trial; add one
in `CustomPaywall.tsx` if your RevenueCat products carry an introductory offer.

**Counter.** The three stat tiles are equal-width `Card`s in a `Row` with 12 pt gaps; values use the
heading size, `numberOfLines={1}` and `adjustsFontSizeToFit` so "$1,234.50" never wraps. The
captions are sentence case ("Not smoked", not "not smoked"). The clock under the hero lost its raw
2/−3 pt colon margins (now a 2 pt `gap` token).

**Craving.** Close button is a 44 pt target. Copy no longer claims how fast cravings fade or what
works best ("Cravings rise and fall like a wave. Give this one a minute of slow breathing, then see
where it is."). The trigger list is a `Section` with 12 pt between rows. Breathing and done states
center in the free height.

**Slip.** Copy no longer states a statistic ("Slips happen on the way for a lot of people").
The run card is a `Card`; the note field uses `typography.body` instead of a raw font; the hold
button's tint is the `dangerSoft` token instead of a hex suffix.

**Milestones.** A one-line intro under the title; the timeline rows are no longer fixed at 84 pt
(two-line bodies at XL type would have clipped). Two milestone bodies that read like claims were
rewritten ("Cravings come less often" and "Most people who get here keep going").

**History.** Gained a hero: "Time free in all" as the 88 pt numeral (days, or hours on day one),
then three equal tiles (longest run, kept, not had). Sections are 32 pt apart, titles 12 pt above
their cards, list rows 12 pt apart with hairlines, the current attempt marked with a "NOW" pill
(12/8 pt), notes clamp to two lines.

**Settings.** Groups are `Section variant="group"` with hairline dividers between rows; row titles
may take two lines and text containers have `minWidth: 0`, so steppers on the right are never pushed
off screen. The swatch row uses `Row` gaps instead of a margin.

**Sheets.** Start, habit and currency sheets use the 20 pt gutter, 32 pt top under the grabber and
the home-indicator inset + 16 pt at the bottom.

**Dark mode.** Every color comes from the theme; cards keep a 1.5 pt border and dividers use
`border`, which stays visible on the lifted dark surfaces.

Not verified on a device in this round: the owner runs the app at the end.

## Visual QA (Nov 27, iPhone 17 Pro Max simulator)

Walked in light and dark: every onboarding step, the paywall, the mock purchase, the start sheet,
the live counter (odometer roll caught mid-turn), a craving with the breathing circle, milestones,
history and settings, empty and with the sample data. Fixed:

1. Paywall: the yearly plan (the pre-selected one) was below the fold, under the CTA. Ring 184 →
   152 pt, subheadline cut to one line ("Each day free adds $7.50 and 10 cigarettes."), section
   gaps one step tighter. Both plans now sit above the CTA in light and dark.
2. Counter and History stat tiles: "30 cigarettes" shrank to fit beside "$22.50" (two value sizes
   in one row) and "Cravings beaten" was cut to "Cravings bea…". Values are numbers only, the unit
   moved into the caption ("Cigarettes not smoked"), captions may take two lines.
3. Cravings chart said "Peak 1 a day" with nothing logged (the scale floors at 1). It now says
   "None logged this week" until there is a craving.
4. Onboarding subtitles each left one word on its own line; rewritten to fit ("This sets what the
   counter counts.", "Roughly is fine. Fine-tune it later in Settings.", "Every hour you stay free
   turns into money kept.", "Your first month, if you start today.").

Kept: the counter ring and the next-milestone bar read 0% right after a preset start ("3 days
ago", "a week ago"), because each preset lands exactly on a milestone; that is correct, not a bug.
Audit lines kept: the native tab bar; title and detail lines 2–4 pt apart inside one row; the
craving sheet's last trigger row scrolling under its pinned button.
