# Sipwell design notes

Friendly, bubbly, light. One big glass of water is the whole idea: it is the hero on Today, it reacts
to every onboarding answer, it fills to the goal on the "Your plan" step and it stands full on the
paywall.

## Palette (`src/theme/theme.ts`)

| Token | Light | Dark | Use |
|---|---|---|---|
| background | `#F2F8FC` | `#0B1620` | screens |
| surface | `#FFFFFF` | `#13232F` | cards, cup tiles, option rows |
| surfaceRaised | `#EAF3F9` | `#1B2F3D` | empty glass, chart tracks |
| border | `#D8E6EF` | `#24394A` | hairlines, unselected outlines |
| text | `#0F2A3D` | `#E8F2F8` | ink |
| textMuted | `#6B8597` | `#8EA6B6` | captions |
| primary | `#1E9BD7` | `#3FAEE4` | the water, primary action, selection |
| secondary | `#7FD3F5` | `#5CC2E8` | back wave, unmet chart bars, cup fill |
| success | `#1FA26A` | `#3DBE80` | goal reached |

Dark is its own palette: navy surfaces lifted one step each, the accent a little lighter and calmer
so the water still glows without vibrating against the dark.

## Type scale (Nunito, loaded in `app/_layout.tsx` behind the splash)

| Style | Font | Size / line | Notes |
|---|---|---|---|
| numeral | ExtraBold | 72 / 76, -2.5 | today's total, the plan's goal; tabular figures |
| display | ExtraBold | 34 / 40 | large titles |
| title | ExtraBold | 28 / 34 | onboarding and paywall headlines |
| stat | ExtraBold | 28 / 32 | stat tiles, plan prices; tabular figures |
| heading | Bold | 20 / 26 | section titles |
| body | Regular | 17 / 24 | |
| label | Bold | 15 / 20 | rows, buttons |
| caption | SemiBold | 13 / 18 | secondary lines, chart labels |

## Layout grid

All margins, paddings and gaps come from `theme.spacing` (4, 8, 12, 16, 20, 24, 32, 48). Screen
gutter is 20 pt (`spacing.gutter`); scrolling tab screens end with `spacing.tabClearance` (the 49 pt
tab bar plus 24 pt). Section titles sit 12 pt above their content; sections are 32 pt apart.

## Signature interaction: the pour

`src/features/hydration/WaterGlass.tsx`. The water is two SVG paths (front and back wave) rebuilt on
the UI thread every frame by a worklet: a sine surface at the current level, closed down to the base,
clipped to the tumbler outline. Tapping a cup on Today:

1. fires a two-step "gulp" haptic (medium, then light 110 ms later);
2. drops a stream from the rim to the surface (a rounded rect whose head then tail fall over 520 ms);
3. springs the level up (damping 15, stiffness 60) as the stream lands;
4. kicks the wave amplitude to 11 pt and lets it settle back to the 2.5 pt ambient drift on an
   underdamped spring, so the water sloshes and calms;
5. counts the big number up to the new total.

The quiet ambient loop the brief allows for water: the surface drifts and three bubbles rise and fade.
Reduce Motion flattens the surface, hides the stream and bubbles and fades between levels.

## Critique rounds


- Onboarding welcome: a small glass top-left and an empty lower half. Every step had an icon chip
  beside the title that added nothing.
- Today: six identical white cards for cups read as a template grid; "1,800 ml to go" floated
  away from the number; the glass had no scale to read the level against; the Logged today list ran
  under the tab bar; the Reminders chip sat tight to the right edge.
- Paywall: the plan cards were pushed under the sticky CTA; benefit lines wrapped to two lines each.
- Spacing: a 16 pt gutter and odd values (1, 2, 5, 6, 10, 14 pt) mixed into the grid.

Changes: 20 pt gutter and only grid tokens; tab clearance on scrolling tabs; the chip has 12 pt
padding, a hairline border and 16 pt from the title; onboarding content is one centered block (welcome
is a big centered glass with the title under it), icon chips removed and the step icon moved into
the goal caption; Today's cups became a horizontal shelf of tall capsules (each cup drawn at its real
relative size, the custom one dashed), the number gained its unit and one summary line under it
(percent, goal, what is left), the glass gained quarter marks, a pour stream and rising bubbles;
the paywall is a centered full glass, one-line benefits, side-by-side plan cards with the price large
and the per-week price and saving computed, then the trial timeline.

### Round 2 (`r2-*`, after the changes above)

- Related text lines sat 4 pt apart (titles over subtitles, row label over caption, stat over unit,
  "3.3 L" over "a day"): raised to 8 pt everywhere.
- Paywall: the trial timeline was still hidden behind the pinned CTA on the first view. Glass down to
  96 pt, section gaps 24 pt, 28 pt benefit wells, so plans and the whole timeline sit above the CTA.
- Dark mode: the back wave read as a muddy band above the water and the bubbles vanished; the back
  wave is now a brighter cyan in dark and the bubbles use the ink color.
- Cup shelf: pill-shaped tall capsules looked like eggs; they are now rounded rectangles with 16 pt
  vertical padding.
- Welcome: the glass grew to 232 pt so the centered block fills the space above the CTA.

### Round 3 (`r3-*`)

- Paywall: "Reminder before billing" wrapped and its second line slid under the CTA. Now
  "Reminder sent", one line.
- History empty state: the calendar illustration's right column of cells crossed its outline.
  Cells re-spaced on an even 4 pt gap inside the frame.
- Everything else audited clean or with the justified findings below.
- Custom-amount sheet content moved from a 16 pt to the 20 pt gutter (re-shot).


Onboarding (all four steps and the plan), paywall and history audit clean. The remaining lines:

- `EDGE Add Bottle / Add Big bottle` (Today, light and dark): the cup shelf scrolls sideways and
  deliberately bleeds past the right gutter so the next cup peeks out; that peek is the only scroll
  affordance. After scrolling, the first cups run off the left edge the same way.
- `TOUCHING` between rows in Settings (Daily goal / Units, the reminder rows, Restore / Manage, the
  About rows, Load sample data / Reset app): grouped inset rows that share one card and are split by
  a hairline, as in iOS Settings. The text inside each row keeps its 16 pt padding.
- `EDGE`, `HOME` and `TOUCHING` on the three tab bar buttons: the system tab bar, edge to edge by
  design.
- `OVERLAP` between list rows and the tab bar on scrolling tabs: rows scrolled below the visible
  area are still in the accessibility tree; on screen they end above the bar, and the scroll content
  ends with 72 pt (tab bar + 24) of clearance.
- Custom-amount sheet: findings against the dimmed Today screen behind the scrim and against the
  system number pad's keys (they touch by design). The sheet's own controls have no findings.
- The success badge sits over the glass rim on the plan step and the paywall: a deliberate layer.

## Final screenshots

`screenshots/01-welcome.png` to `19-settings-dark.png`: onboarding (welcome, three questions, the
building moment, the plan), the paywall, Today empty and populated, a frame mid-pour, the cup shelf
scrolled, the custom amount sheet, History empty and populated, Settings top and bottom, and dark
mode for Today, History and Settings.
