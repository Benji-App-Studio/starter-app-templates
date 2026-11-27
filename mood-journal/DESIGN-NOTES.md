# Daymood design notes

Warm, personal, color-coded. The references for taste were How We Feel (the color field) and

## Palette (`src/theme/theme.ts`)

| Token | Light | Dark | Used for |
|---|---|---|---|
| background | `#FBF7F2` | `#1A1614` | screens (tinted by the mood on Today, the welcome step and the Day sheet) |
| surface | `#FFFFFF` | `#272120` | cards, grouped rows, the text field, the ring around the dial face |
| border | `#ECE4DB` | `#3A312E` | hairlines, dividers, empty pixels, inactive chip edges |
| text (ink) | `#2A2320` | `#F5EEE7` | headings, body, the trend line |
| textMuted | `#857A73` | `#A99E96` | eyebrows, captions, axis labels |
| primary (accent) | `#D96C8A` | same | the CTA, selection, tab tint, the plant's flower |
| mood 1 → 5 | `#5B6CC8` `#7FA7D9` `#B9B39F` `#F2B35B` `#E9776B` | `#6E7CC6` `#86A8D1` `#A8A392` `#E2AE66` `#DD8074` | faces, the dial's field, pixels, dots, tags on a saved day |
| leaf / pot | `#6E9B6A` / `#D9C6B4` | `#86AE80` / `#5A4A42` | the streak plant and its progress bar |
| shade | `#1E1512` | same | mixed into a mood color for the eyes and mouth of a face |

Dark is not inverted light: a warm near-black background, surfaces two steps up, mood colors with
a little less saturation so a full year of pixels does not glow. The accent stays on the primary
action, selection and the flower. A screen gets a wash of color only when the user puts it there:
the background mixed with 20 % (26 % in dark) of the current mood. The paywall uses a fixed wash of
"Good" (16 %, 14 % in dark) to show the product in its happy state.

## Type

Newsreader (serif) for the journal voice, headings and numbers; Work Sans for the UI. Loaded in
`app/_layout.tsx`, splash held until they load.

| Style | Face | Size / line | Used for |
|---|---|---|---|
| display | Newsreader 600 | 40 / 44, −0.8 | large titles, the mood word under the dial, the paywall headline |
| title | Newsreader 600 | 30 / 34, −0.4 | Today's title, onboarding titles |
| heading | Newsreader 600 | 22 / 28 | sheet titles, empty states, the average mood tile |
| journal | Newsreader 400 italic | 19 / 28 | the user's own words, prompts |
| journalSmall | Newsreader 400 italic | 17 / 24 | notes in the entries list |
| body | Work Sans 400 | 17 / 24 | rows, option text |
| label | Work Sans 600 | 15 / 20 | buttons, chips, card titles |
| caption | Work Sans 500 | 13 / 18 | hints, secondary lines |
| eyebrow | Work Sans 600 | 12 / 16, +1, uppercase | section titles, dates |
| micro | Work Sans 500 | 11 / 14 | tab labels |
| stat | Newsreader 600 | 36 / 40, tabular | streak counts |
| numeral | Newsreader 600 | 64 / 68, tabular | reserved for a hero number |

`Text` caps Dynamic Type at 1.6×. Counting numbers use `AnimatedNumber` (spring, tabular digits).

## Spacing and layout

`spacing`: 4 · 8 · 12 · 16 · 20 (gutter) · 24 · 32 · 48. `layout`: tab bar 49, CTA 54, hit target
44, icon button 36, hairline 1, option border 1.5. Components use only these.

Primitives in `src/components/`:

- `Screen`: top inset, 20 pt gutter, optional collapsing large title (`title`, `eyebrow`,
  `accessory`), `tab` adds tab bar + inset + 24 pt at the bottom, `footer` renders `BottomCTA`,
  `gap` spaces direct children.
- `BottomCTA`: the pinned action area, gutter on both sides, 16 pt above the home indicator.
- `Stack` / `Row`: column / line with a grid gap; siblings never carry margins.
- `Section`: an uppercase eyebrow 12 pt above its content; screens space sections 24 pt apart.
- `Group`: inset grouped rows with hairline dividers (Settings, the reminder sheet).
- `Card`: 16 pt padding, hairline edge, no shadow. `Chip`: 16 pt × 8 pt, icon 8 pt from label.

## The signature interaction: the mood dial

`src/features/journal/MoodDial.tsx` + `MoodFace.tsx` + `useMoodTint.ts`.

- An SVG arc (198° → 342°, radius 42 % of the width) stroked with a five-stop gradient of the
  mood scale over a softer, wider stroke. Five small dots mark the steps.
- The face is its own SVG: a disc whose fill, mouth curve and eye squint are `useAnimatedProps`
  interpolations of one shared value `progress` (0 awful, 1 great). It sits in a white ring so it
  reads as something to pick up.
- `Gesture.Pan().minDistance(0)` maps the finger's x between the arc's ends to `progress` on the
  UI thread; the face rides the arc via `useAnimatedStyle` and lifts to 1.08 while held. Crossing
  into a new fifth fires `Haptics.selectionAsync()` and updates the word. On release the value
  springs to the nearest step (damping 16, stiffness 190), the face settles back, and a success
  haptic marks the commit. Reduce Motion: snap instead of spring, no lift.
- The same shared value drives `useMoodTint`, so the whole screen takes on the mood while
  dragging. The welcome step of onboarding uses the live dial so the first thing a person does
  is the core interaction; the Day sheet reuses the editor; the paywall shows the dial at "Great".
- VoiceOver: the dial is `adjustable` with increment/decrement actions and the mood as its value.

The second half of the identity is the **year in pixels** (`YearPixels.tsx`): twelve measured
columns of rounded squares, today outlined in ink, one tap opening the day as a form sheet.

## The streak plant

`Plant.tsx` draws a pot and a plant in five stages (seed, sprout at 1 day, bud at 3, bloom at 7,
garden at 21) in the leaf, accent and mood colors. On each new stage the plant springs up out of
the pot (scale from the soil line, damping 9); Reduce Motion fades instead. It sits in the
streak card with a bar to the next stage, and sprouts on the "your journal is ready" step.

## Motion

Springs only: the onboarding progress bar, plan lines, entries (`FadeInDown.springify()` with a
small stagger and `LinearTransition`), counts (`AnimatedNumber`), the streak bar, the plant, the
dial. Nothing loops.

## Screen-by-screen self-review (against DESIGN.md 2 and 2b)

| Screen | Hero | Layout check | Notes |
|---|---|---|---|
| Onboarding 1 (welcome) | live mood dial, screen tints | progress bar, hero `flex: 1` centered, copy, `BottomCTA`; gutter 20 | try-it hint changes to the mood word |
| Onboarding 2 (focus) | journal page with the prompt the answer sets | same layout; four 60 pt options, 12 pt apart, 2-line labels | haptic tick and pressed scale on options |
| Onboarding 3 (check-in time) | sky arc, sun/moon moves to the hour | same layout | |
| Onboarding 4 (your plan) | plant, seed → sprout | lines reveal over ~1.5 s, title switches from building to ready | lines are the real settings |
| Paywall | dial at "Great" on a warm wash | personalized hour and prompt; benefits with SF Symbols; plans with per-week price and computed saving; trial timeline; CTA says "Start my 7-day free trial"; Restore · Terms · Privacy | no close button |
| Today (empty) | dial, tinting | eyebrow date + title, dial + mood word, tags section, note section, Save; tab padding | Save stays disabled until the face is moved |
| Today (saved) | dial at the day's mood | mood word, tags in the mood color, note in serif, streak plant card, two equal buttons | |
| Journal | year in pixels | large title with a 44 pt year switcher, legend on one line, entries with one-line titles and two-line notes; tab padding | designed empty state with action |
| Trends | hand-drawn mood line | range chips, line card, two equal tiles, the mix, lift/weigh columns; sections 24 pt apart | empty state below two check-ins |
| Day sheet | dial, tints | 44 pt trash and close buttons, gutter 20, bottom inset | future days are not editable |
| Reminder sheet | — | grouped hours with dividers, bottom inset | permission is asked only from the Settings switch |
| Settings | — | grouped inset rows with dividers under section eyebrows; tab padding | base rows kept; reminder rows added |

every row text container is `flex: 1, minWidth: 0` with `numberOfLines`; headlines cap at 2–3 lines;
every tab screen passes `tab`; all text containers have padding; dark values exist for every token.
Not yet seen on a device: this round was built without the simulator by the owner's instruction.

## Visual QA (Nov 27, iPhone 17 Pro Max simulator)

Walked every screen in light and dark, dragged the dial, wrote and saved a check-in, loaded the
sample data. Fixed:

1. Crash on the signature interaction: dragging the face threw "Tried to synchronously call a
   Remote Function (scoreForProgress) on the UI Runtime". `scoreForAverage`, `progressForScore`
   and `scoreForProgress` in `moods.ts` are now worklets.
2. The face (with its halo) ran past the dial's width at both ends of the arc, touching the screen
   edge at Awful and Great. The arc radius is now capped so the face stays inside the dial.
3. Writing the note: the keyboard covered the note field. `Screen` takes a `scrollRef`; Today (and
   the past-day sheet) scroll to the end when the note gets focus, so the note and Save sit above
   the keyboard. After saving, Today scrolls back to the top (it used to open the saved page
   half-scrolled, title cut off).
4. Year in pixels: days still to come were filled with the surface colour on a surface card, so
   all of December (and the rest of November) vanished. Future days are outlined now.
5. Trends: on 30 and 90 days the last regular date label ran into today's ("Nov 22Nov 27"). A
   label closer than 64 pt to today's is skipped.
6. Paywall: the plans and the trial timeline were a full screen below the CTA. Hero dial capped at
   240 pt, the eyebrow and the quoted prompt removed, headline "Keep a year of you" (one line),
   body two lines, three one-line benefits, the timeline as three compact columns. Everything
   now fits above the CTA in light and dark.
7. Copy: "What would you like from this?" (orphan "this?") → "What brings you here?"; the welcome
   body no longer ends on a lone "appears.".
8. Settings: the third theme swatch disappeared into the card in both modes; swatches have a 1 pt
   border. VoiceOver no longer reads SF Symbol names inside chips and rows ("Briefcase, Work").

Audit lines kept on purpose: the native tab bar (EDGE/HOME); eyebrow-over-title pairs (0–4 pt is
the type's own line gap in one header block); 4–5 pt between a row title and its detail line.
