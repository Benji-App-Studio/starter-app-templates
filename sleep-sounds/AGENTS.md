# Notes for AI coding agents

This is an Expo (SDK 58) + Expo Router + TypeScript app: Nightmix, a sleep-sounds mixer. Read
`README.md` and `DESIGN-NOTES.md` first, then the rules in `../CONTRACT.md` and `the design notes` if
this app lives inside the templates repo.

## Commands

```bash
npx expo install <package>   # always, instead of npm install <package>: picks the SDK-compatible version
npx expo run:ios             # development build (needed for audio in the background and RevenueCat)
npx tsc --noEmit             # typecheck; must be clean before you finish
npx expo-doctor              # dependency and config check; must have no errors
npx expo export --platform ios   # proves the app bundles
scripts/make-sounds.sh assets/sounds   # regenerate the eight loops with ffmpeg
```

## Where things live

- `app/` is routes only. Each file is a screen or a layout; keep them thin and put the
  real code in `src/features/<feature>/`. `timer.tsx` and `save-mix.tsx` are form sheets.
- `src/features/mixer/engine.ts` is the only place that touches `expo-audio`: one looping player
  per sound in the mix, the sleep timer on wall-clock time, the fade-out, and the night logged to
  `sessions` when the mix stops. Screens read it with `useMixer()` and call `mixer.*`.
- `src/features/mixer/plan.ts` turns the onboarding answers into the first mix and timer. The
  onboarding closing step, the paywall and the mixer's first launch all use it.
- `src/config/` holds the copy and options a non-coder edits: onboarding steps, paywall
  text and plans, support email and legal links.
- `src/theme/theme.ts` is the only place for colors, fonts, spacing, radii and type styles.
  Use `useTheme()`; never hard-code a color in a screen. Sound tints live in `sounds.ts`.
- `src/components/` are the shared building blocks. `Icon` maps meaning names to SF Symbols
  (iOS) and Ionicons (Android); add new icons to `icons.ts`, never import an icon set in a screen.
- `src/db/` is the SQLite layer: `migrations.ts` (append, never edit) and one file per table.
- `src/purchases/` is the only module that talks to RevenueCat. Screens call
  `getEntitlement()`, `purchase()`, `restore()`.
- `src/state/appState.ts` is the tiny persisted store the root layout routes on, plus the
  default timer and fade length.

## Rules

- Expo APIs change every release. Check `node_modules/<package>/build/*.d.ts` or
  https://docs.expo.dev/versions/v58.0.0/ rather than memory.
- `ios/` and `android/` are generated. Configure native behaviour in `app.json`.
- Animations use Reanimated springs and gestures use Gesture Handler; respect
  `useReducedMotion()`. Haptics on the commit moment only.
- No TODO comments, placeholder text, or unused code in finished work.
