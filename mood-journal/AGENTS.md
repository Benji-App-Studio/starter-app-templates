# Notes for AI coding agents

This is an Expo (SDK 58) + Expo Router + TypeScript app: a mood and gratitude journal. Read
`README.md` first, then the rules in `../CONTRACT.md` if this app lives inside the templates repo.

## Commands

```bash
npx expo install <package>   # always, instead of npm install <package>: picks the SDK-compatible version
npx expo run:ios             # development build (needed: native modules). Press r to reload.
npx tsc --noEmit             # typecheck; must be clean before you finish
npx expo-doctor              # dependency and config check; must have no errors
npx expo export --platform ios   # proves the app bundles
```

## Where things live

- `app/` is routes only. Each file is a screen or a layout; keep them thin and put the
  real code in `src/features/<feature>/`.
- `src/config/` holds the copy and options a non-coder edits: onboarding steps, paywall
  text and plans, support email and legal links.
- `src/theme/theme.ts` is the only place for colors (light and dark, plus the five mood
  colors), fonts, spacing, radii and type styles. Use `useTheme()`; never hard-code a color,
  a font size or a spacing number.
- Lay screens out with `Screen` (gutter, safe areas, large title, `tab` for tab-bar padding,
  `footer` for the pinned button) and space siblings with `Stack` / `Row` / `Section` gaps,
  never margins on children.
- `src/components/` are the shared building blocks. `Icon` maps a meaning to an SF Symbol
  (iOS) and an Ionicon (Android); add new icons to `src/components/icons.ts`.
- `src/features/journal/` is the product: `MoodDial` (the drag interaction), `MoodFace`
  (the SVG face), `Plant` (the streak companion), `YearPixels`, `TrendLine`, and the
  Today / Journal / Trends / Day screens.
- `src/db/` is the SQLite layer: `migrations.ts` (append, never edit) and one file per table.
- `src/purchases/` is the only module that talks to RevenueCat.
- `src/state/appState.ts` is the tiny persisted store the root layout routes on.

## Rules

- Expo APIs change every release. Check `node_modules/<package>/build/*.d.ts` or
  https://docs.expo.dev/versions/v58.0.0/ rather than memory.
- `ios/` and `android/` are generated. Configure native behaviour in `app.json`.
- Animations use Reanimated springs and respect `useReducedMotion()`.
- No TODO comments, placeholder text, or unused code in finished work.
