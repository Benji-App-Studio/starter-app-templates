# Design notes: Nightmix

Feel: dark, soft, generative. Night is the app's native state, so dark is designed first and
light is the daytime version of it, not an inversion. References for taste only: Endel's living
backgrounds, Calm's calm, Rain Rain's plainness.

## Palette (`src/theme/theme.ts`)

| Token | Dark | Light | Used for |
|---|---|---|---|
| background | `#0B0A1A` | `#F4F2FB` | screens |
| surface | `#16142B` | `#FFFFFF` | cards, tiles, grouped rows |
| surfaceRaised | `#201D3A` | `#ECE9F8` | an active tile, a control on a card |
| border | `#2A2745` | `#DDD9EE` | hairlines, arc tracks |
| text | `#ECEAF7` | `#14122A` | ink |
| textMuted | `#8C88A8` | `#6F6B8A` | secondary copy, labels |
| primary (accent) | `#8A7CFF` | `#5B4BD6` | the hero, play, selection, the timer arc |
| primaryDeep (accent-2) | `#3B2F8F` | `#3B2F8F` | the resting blob, Android icon background |
| success / danger | `#6EE7A8` / `#FB7185` | `#16A34A` / `#DC2626` | "Rested", destructive rows |

The light accent is darker than the dark-mode one so white text on it and accent text on the
light background both pass AA. Each sound also carries a tint (`sounds.ts`) that only the blob and
the saved-mix bars use: rain blue-violet, ocean teal, brown noise amber, and so on. The accent is
otherwise rare; most of the UI is the two neutrals.

## Type scale

Outfit, loaded in the root layout; the splash stays up until it is in.

| Style | Face | Size / line | Notes |
|---|---|---|---|
| numeral | Light 300 | 72 / 76, -2.5 tracking | countdown and timer, tabular digits |
| display | Light 300 | 40 / 46, -1 | "All night" |
| title | Medium 500 | 28 / 34, -0.5 | onboarding and paywall titles; tab screen titles use Light 34 |
| heading | Medium 500 | 20 / 26 | card titles, the mix name |
| body | Regular 400 | 17 / 24 | |
| label | Medium 500 | 15 / 20 | buttons, option labels |
| caption | Regular 400 | 13 / 18 | metadata, axis labels |

Every number that changes while visible (`CountUp`, countdown, dial, percent while dragging) is
set tabular so it never jitters. Text caps the Dynamic Type multiplier at 1.6 so the mixer still
fits at XL.

## Signature interaction

**The breathing blob** (`features/mixer/Blob.tsx`). Three overlapping closed Catmull-Rom curves
through seven points, each point's radius wobbling with two slow sines. A `useFrameCallback`
advances a shared `time` at a `speed` that springs lower when a mix plays, and an `amp` that
springs higher with each sound added: the shape breathes deeper and slower, like someone falling
asleep. Each layer is filled with a radial gradient in a tint from the mix (first three sounds),
fading to 5% at the edge, so the layers blend softly without a blur view. Adding or removing a
sound dips the layers' opacity and springs it back (a pulse), so the hero answers every change.
With Reduce Motion the frame callback stops and only the opacity moves.

**The volume arc** (`SoundTile.tsx`). Each tile has a three-quarter arc around its icon
(`strokeDasharray` on a circle, offset driven by `useAnimatedProps`). Tap toggles the sound;
press, hold 180 ms and drag up or down to set the level, with `Haptics.selectionAsync()` every 5%
and the percentage replacing the name while you drag. `Gesture.Race(pan, tap)` keeps the grid
scrollable: a quick swipe scrolls, a hold adjusts.

**The timer dial** (`TimerDial.tsx`). A 300° ring with ticks every five minutes; the pan converts
the finger's angle around the centre to minutes, clicks the haptic engine per step and springs the
knob into place. It opens in a native form sheet (`presentation: 'formSheet'`,
`sheetAllowedDetents: 'fitToContents'`) from the centre of the blob or the timer button.

Supporting motion: list rows enter with `FadeInDown.springify()` and reflow with
`LinearTransition`; the three Nights numbers count up with a spring (`CountUp`); the onboarding
progress bar springs; the closing onboarding step shows the mix being shaped for 1.2 s while the
plan is computed, then the plan card drops in.

## Structure

- Large titles (Saved mixes, Nights, Settings) in Outfit Light 34 at the top of the content; once
  they scroll away a compact blurred bar with the same title fades in (`Screen`'s `title` prop).
  The mixer has no title, the blob is the title.
- Translucent tab bar over a `BlurView`; screens pad their end by the bar's height.
- Grouped inset rows in Settings with hairline dividers; no chevron on rows that are values.
- Empty states are small SVG drawings in the palette (`NightIllustration`): a crescent over
  hills, a constellation, three bars.
- Charts by hand: seven rounded bars, dashed half and full gridlines, tonight in the accent.

## Layout grid

Every margin, padding and gap comes from `theme.spacing`: 4, 8, 12 (`item`, siblings in a list
or grid), 16, 20 (`gutter`, the left and right screen margin), 24, 32, 48. Text pairs (a title
and its line underneath) sit 8 apart, list siblings 12, sections 24. Scrollable tab screens pad
their end by the tab bar plus 24; the bottom CTA sits 16 above the home indicator. The only raw
numbers left in styles are optical nudges: the play glyph moves 2–3 pt right so the triangle looks
centred in its circle.

## Critique rounds


- The caption under the blob number ("minutes, then silence") was muted grey and vanished where
  the blob's layers overlap. Now `HeroCaption`: ink at 86% with a soft halo in the background
  colour, legible on every tint in both themes.
- The paywall's selected yearly plan was hidden under the sticky CTA on first view. The blob is
  now 150 pt, yearly is listed first, and both plans sit above the CTA. The "Best value" badge
  from the config was never drawn; it is now the pill, and the saving moved to its own line
  ("85% less than paying weekly").
- The welcome step was a blob, a title and an empty lower half. It now lists the three things the
  app does, each with an SF Symbol in a soft accent tile, entering one after another.
- The "Your night" step's 1.2 s build showed only a label. It now writes out how each answer
  shaped the plan (one line per answer, from `plan.ts`), then drops the plan card in.
- The "Winding down" answer promised soft levels but changed nothing; the plan now sets the mix a
  quarter lower for it. The plan's unused `summary` field was removed.


- Audit: title and caption pairs sat 4–5 pt apart everywhere (TOUCHING). All text pairs now use 8.
- Audit: the hero number and its caption touched (4 pt; 0 pt in the timer dial). Gap 8 in the
  blob, the onboarding preview and the dial.
- Gutter was 16; now 20 on every screen and footer. Option and plan rows were 8 apart; now 12.
- Light welcome step: the moon glyph was ink on the saturated violet blob, low contrast. It is
  white on that blob in light mode.
- Saved: the swatch column grew with the number of sounds, so a three-sound mix pushed its name
  right of the others. The column is now a fixed width.
- Nights: "average per night" wrapped to two lines in its stat card while the others took one;
  now "average night". The Rough/Okay/Rested choices looked like plain text on the
  card because chips used the card's own surface; chips now use the raised surface.
- The orphan word in the "Your night" body ("…from the / mixer.") is gone with shorter copy.

### Round 2 (dark onboarding and paywall, both themes for the tabs)

- The native large titles (react-native-screens) rendered blank on Settings and Nights about half
  the time: the header space was there, the words were not. Replaced with an in-content title
  that hands over to a compact blurred bar on scroll; the three tab stacks were removed.
- Settings section headers sat 4 pt above their group; now 12. The two sheets' titles sat 5 pt
  under the grabber; sheets now start 32 pt down.
- The paywall's weekly card ran under the CTA once the plan cards got 8 pt text gaps; the blob went
  to 128 pt and the cards are 12 apart.
- Mix names: three sounds read "Rain + 2 more", which says nothing. Three sounds are now named in
  full ("Rain, White noise + Brown noise"); four or more name two and count the rest.
- Nights stat label shortened so all three stat cards are two lines.

### Round 3 (final set)

- A longer mix name pushed the paywall subtitle to three lines and the weekly card back under the
  CTA. The subtitle is now the mix, its fade-out and "Free for your first seven nights.", two lines.
- In the dark paywall shot "45 min" broke across two lines. The value now uses a no-break space;
  this text change came after the final paywall shots, so they still show the break.
- Every kept screen was audited; the remaining findings are listed below. Audit files were not
  kept; the findings for each kept screen are summarised here.

### Audit findings kept on purpose

- Tab bar buttons touch each other and the screen edges: that is the native tab bar's layout.
- Grouped Settings rows touch each other (gap 0): grouped inset rows share hairline dividers, as in
  iOS Settings.
- Rows reported under the tab bar, or behind the paywall footer, are scrolled content passing under
  a translucent bar or the footer's fade, not placed there.
- Paywall: the trial timeline under the plans is reported as overlapping the CTA and footnote; it
  is the scrolled part of the page passing under the footer's fade, and the plans above it are
  clear of the CTA.
- During the 1.2 s "building your plan" moment the reason lines are mid-animation and the audit
  sees each twice; the settled screen audits clean.
- With the timer sheet open, the audit also reads the mixer behind it and reports overlaps between
  the two layers; only findings inside the sheet were acted on.
