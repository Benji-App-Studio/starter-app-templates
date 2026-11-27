# Deepflow design notes

Feel: tactile, minimal, warm. A kitchen timer you can trust, not a dashboard. Most of the UI is
cream and ink; the orange is spent on the one thing that matters on each screen.

## Palette

| Token | Light | Dark | Used for |
|---|---|---|---|
| background | `#FAF6F1` | `#15110E` | screens |
| backgroundFocus | `#F3E9DD` | `#1C140F` | the screen while a session runs (calmer, warmer) |
| surface | `#FFFFFF` | `#221C17` | cards, the dial face, inputs |
| surfaceStrong | `#EFE7DD` | `#2E261F` | tracks, inactive bars, secondary buttons |
| border | `#E7DED3` | `#38302A` | hairlines |
| text (ink) | `#1D1712` | `#F5EFE8` | |
| textMuted | `#857A70` | `#A3968A` | captions, placeholders |
| primary (accent) | `#C2410C` | `#C2410C` | the wedge, Start, selection, today's bar |
| secondary (break) | `#2E7D6B` | `#4FA08D` | breaks, "saved", savings badge |
| danger | `#B3261E` | `#E2645B` | delete rows |

Dark mode lifts the surfaces toward warm brown rather than inverting, and desaturates the green;
the orange keeps its hue because it sits on near-black at AA contrast.

## Type scale

Unbounded (500/600) for numbers that mean something, Inter (400–700) for everything else.

| Variant | Face | Size / line | Notes |
|---|---|---|---|
| numeralLarge | Unbounded 600 | 88 / 96, −4 tracking | minutes on the idle dial |
| numeral | Unbounded 600 | 64 / 72, −2.5 | the countdown |
| numeralMedium | Unbounded 600 | 44 / 52, −1.6 | the week total on the History hero |
| numeralSmall | Unbounded 500 | 26 / 32, −0.8 | stat tiles, minutes per session |
| display | Inter 700 | 34 / 40, −0.8 | |
| title | Inter 700 | 28 / 34, −0.6 | onboarding and paywall headlines |
| heading | Inter 600 | 20 / 26 | the running session's label |
| body | Inter 400 | 17 / 24 | |
| label | Inter 600 | 15 / 20 | buttons, option titles |
| caption | Inter 500 | 13 / 18 | secondary lines, axis labels |
| eyebrow | Inter 600 | 12 / 16, +0.8 | uppercase section and stat eyebrows, the "Save NN%" badge |
| input | Inter 500 | 16 / 22 | the session label field |
| tab | Inter 500 | 11 / 13 | tab bar labels |

Every numeral variant sets `fontVariant: ['tabular-nums']`, so digits do not shift as they tick.
Numerals cap Dynamic Type at 1.2×, text at 1.6×.

## The signature interaction: the dial

`src/features/focus/Dial.tsx`, drawn with react-native-svg and driven by reanimated.

- Geometry: 60 ticks around the rim (every fifth is longer and ink-coloured), a white dial face,
  a wedge from 12 o'clock clockwise, and a knob at the wedge's end. One full turn = 60 minutes,
  like a kitchen timer.
- Setting: a `Gesture.Pan` on the whole dial. On every move the angle of the finger from the
  centre is compared with the previous angle and the delta is added to a shared value (so the
  wedge turns relative to where you grabbed, with no jump, and cannot wrap past 60 or below 1).
  Whole minutes are derived from the angle; each change schedules `Haptics.selectionAsync()` on
  the JS thread, one click per minute, and the Focus screen's `AnimatedNumber` counts to it.
  On release the wedge springs to the exact minute.
- Running: the wedge is no longer interactive; each second the screen passes the remaining
  minutes and the dial glides to them with a linear 1 s `withTiming`, so it unwinds continuously
  rather than stepping. The screen background tints to `backgroundFocus` with a 600 ms
  `interpolateColor`, the header collapses to the eyebrow + label, and the controls reduce to
  Pause and End.
- Done: the wedge shows the finished length in the break green with a check in the middle; the
  break then runs in green on the same dial.
- Reduce Motion: springs and glides become immediate sets; the fade-ins stay.

Supporting motion: the daily-goal dots fade in as sessions complete, history rows animate in and
re-layout on delete (`FadeIn`/`LinearTransition`), stat numbers count up (`AnimatedNumber`, a
read-only TextInput updated on the UI thread), the onboarding progress bar springs.

## Onboarding and paywall

Five steps with a top progress bar. Every step shows the dial reacting to the answer: the welcome
shows 25 minutes; the purpose step shows the first label that choice will suggest; the length step
springs the wedge to 15/25/45/50; the goal step shows the session count on the dial and the goal
dots under it; the plan step winds the dial from zero for 1.3 s ("Setting your dial…"), then
reveals the computed plan: session and break length, sessions per day and the hours that makes,
the starting labels.

The paywall opens on the same dial in its finished state ("Your 25-minute dial is ready"), four
benefits with SF Symbols, two plan cards (yearly pre-selected, per-week price and "Save NN%"
computed from the two prices), a Today / Day 5 / Day 7 trial timeline, a CTA that says what
happens ("Start my 7-day free trial"), and Restore · Terms · Privacy at the bottom. No close.

## Layout tokens

- `spacing` (8-pt grid): xs 4, sm 8, ms 12, md 16, gutter 20, lg 24, xl 32, xxl 48. No other number is
- `sizes`: cta 56, row 52, hit 44, chip 36, iconTile 32. Chips are 36 pt with `hitSlop` to reach 44.
- `Screen` owns the safe areas, the 20 pt gutter and the pinned CTA (12 pt above it, 16 pt above the
  home indicator). `Stack` / `Row` own sibling spacing via `gap`; no child sets its own margin.
- Section rhythm: an eyebrow sits 12 pt above its content, sections are 24 pt apart, list items 12 pt.


The owner switched the build to code only before any screenshot round ran, so there are no
screenshots. Instead every screen was rebuilt on the layout primitives above and reviewed line by

1. **Tokens and primitives everywhere.** 24 raw spacing/font/color values removed; `Stack`, `Row`,
   `sizes`, `dangerSoft`, `eyebrow`/`input`/`tab` styles added; the gutter went from 16 to 20 pt.
2. **Full-bleed focus.** While a session runs the tab bar hides, the screen pads the bottom safe
   area itself, and the background warms to `backgroundFocus`. A success haptic marks the session's
   end (also when it finished while the phone was down); letting go of the dial gives a firmer click
   than the per-minute ticks; Start is a medium impact.
3. **Sized to the device.** The dial is min(width − 40, 42% of height, 340) pt, the onboarding
   preview min(236, 27% of height), the paywall hero min(220, 24% of height), so small phones keep
   the CTA in view and big phones get a bigger hero.
4. **History has a hero.** "Focused this week" in Unbounded 44 over a taller hand-drawn week chart
   in one card, then Today and Streak as two equal tiles (three tiles were too narrow for "12h 30m").
5. **Onboarding balance.** The preview sits in a `flex: 1` area that centres in the free space, so the
   welcome and plan steps no longer stack at the top; copy is left-aligned; the plan lines sit in a
   card; the building moment shows the real numbers being set.
6. **Paywall.** Left-aligned copy under the finished dial; the badge is a 12 × 4 pt padded pill in the
   eyebrow style; the trial timeline copy is short enough for three columns; the CTA says what
   happens with or without a trial.
7. **Contract fixes.** The last onboarding button reads "Get started"; the unused native modules
   (expo-audio, expo-asset, expo-blur, expo-linear-gradient) and their config plugins are gone.

## Screen-by-screen self-review (DESIGN.md 2 and 2b)

| Screen | Hero | Layout check | Text check |
|---|---|---|---|
| Onboarding 1–4 | Live dial reacting to each answer (minutes, label, goal + dots) | Progress bar, hero `flex: 1` centred, copy + options in a 24 pt stack, pinned CTA; options are full-width 16 pt cards, 12 pt apart, radio on the right | Titles max 3 lines, option labels 1 line, details 2 lines |
| Onboarding 5, Your plan | Dial winds from 0 for 1.3 s, then turns green at the plan length | Same frame; plan lines in a card, 16 pt apart | Title 2 lines; every number computed from the answers |
| Paywall | The finished green dial with a check, personalised "Your 25-minute dial is ready" | 24 pt stack: hero, copy, 4 benefit rows (32 pt icon tiles, 12 pt gap), 2 plan cards, trial timeline; CTA + footnote + links pinned | Benefits 2 lines max, plan caption 2 lines, footnote 3 lines |
| Focus, idle | The dial, 340 pt on large phones, drag to set with a click per minute | Header row (eyebrow, goal dots, streak pill 12 pt padded) / dial `flex: 1` / label field 52 pt, chip strip scrolling edge to edge with the first chip on the gutter, Start 56 pt | Counts `tabular-nums`, header caption truncates before the pill moves |
| Focus, running / paused / done | The dial unwinding; clock shrinks to fit (`adjustsFontSizeToFit`, min 0.6) | Tab bar hidden, bottom safe area padded; the bottom block keeps its height so the dial does not jump between states | Label 1 line with ellipsis |
| History | Week total over the week chart (today in the accent, future days dashed outlines) | 12 pt list rhythm, 24 pt before each day header, equal tiles, rows: label/time column `flex: 1, minWidth: 0`, minutes, delete with 12 pt hitSlop | Labels and times 1 line; minutes never wrap |
| History, empty | Small SVG dial at zero | Centred block: illustration, 2-line title, 3-line body, one action | |
| Settings | (a list screen: a collapsing large title instead of a hero) | Grouped inset sections, eyebrow 12 pt above, hairlines between rows, 24 pt between sections, steppers 44 pt tall | Row titles 2 lines max, values right-aligned |

Kept on purpose: the Focus screen centres its header and controls during a session (one centred
column under the hero number), and onboarding/paywall heroes are centred because they are the hero
element; all copy elsewhere is left-aligned.


## Visual QA (Nov 27, iPhone 17 Pro Max simulator)

Every screen walked on the simulator in light and dark, the dial dragged and a session started.
Fixed:

1. The dial: the digits and their caption sat on top of the wedge, so "45" was ink on rust and
   "min · turn the dial" disappeared. The dial now has a cap in the middle (like the knob of a
   kitchen timer, `dialHubRadius`, 66% of the wedge radius); the children sit on the cap and the
   wedge shows as the band around it. The tick band, knob and stroke widths scale with the dial
   size so the small onboarding and paywall dials keep the proportions.
2. Running session: the clock moved under the dial at the full numeral size (it would have had to
   shrink to fit the cap); the cap shows "of 24 min". The dial is 82% of the idle size so the
   stack still centres in the calm screen.
3. Onboarding question steps: the fourth option sat under the Continue button. The dial preview on
   question steps is 20% of the screen height (was 27%), the welcome dial grows to fill its free
   space, and the titles were rewritten to fit one line ("What are you focusing on?", "How long
   can you hold focus?"; the welcome title no longer leaves "down." alone on a line). Preview
   numerals are sized from the cap so two digits always fit (the goal step's "4" did not render
   at all at the old size). Goal options no longer promise "two focused hours" whatever the
   length ("A solid morning", "Most of a workday").
4. Paywall: the yearly plan and the whole trial timeline were under the pinned CTA on first
   view. Dial 220 → 136 pt, benefits shortened to one line each, timeline captions to "Nothing
   charged" / "Reminder sent" / "First charge", section gaps 24 → 16 pt. It now fits above the CTA.
5. Settings and History large titles: the native large title rendered blank (Settings from the
   start, History after the first scroll) on iOS 26 with the tinted header. The tab stacks now
   hide the native header and `Screen title=…` draws a large title that collapses into a compact
   bar on scroll (`src/components/CollapsingTitle.tsx`; History's section list uses the same hook).
6. Settings: the third theme swatch (surface colour) was invisible on the card; swatches have a
   1 pt muted border.
7. VoiceOver read SF Symbol names inside buttons ("bookmark, Studying"). `Icon` is now hidden from
   accessibility; the row or button carries the label.

Audit lines kept on purpose: the native tab bar (EDGE/HOME), the numeral and its caption on the
cap (one stacked label, 0–4 pt is the type's own line gap), the eyebrow over the session label on
the running screen (5 pt, one header block), and the label chips' horizontal scroller running to
the screen edge (it scrolls; the cut chip says so).
