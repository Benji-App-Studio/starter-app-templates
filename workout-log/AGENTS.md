# Notes for AI coding agents

This is an Expo (SDK 58) + Expo Router + TypeScript app: a strength workout log. Read `README.md`
first, then `DESIGN-NOTES.md` (palette, type, the set-table interaction), then the rules in
`../CONTRACT.md` if this app lives inside the templates repo.

## Commands

```bash
npx expo install <package>   # always, instead of npm install <package>: picks the SDK-compatible version
npx expo start               # dev server (press i for the iOS simulator)
npx tsc --noEmit             # typecheck; must be clean before you finish
npx expo-doctor              # dependency and config check; must have no errors
npx expo export --platform ios   # proves the app bundles
```

## Where things live

- `app/` is routes only. Each file is a screen or a layout; keep them thin and put the
  real code in `src/features/<feature>/`.
- `src/config/` holds the copy and options a non-coder edits: onboarding steps, paywall
  text and plans, support email and legal links.
- `src/theme/theme.ts` is the only place for colors, fonts, spacing, radii and type styles.
  Use `useTheme()`; never hard-code a color in a screen. Numbers that change use a `numeral*`
  variant (tabular figures); icons go through `src/components/Icon.tsx` (SF Symbols + fallback).
- `src/components/` are the shared building blocks. Reuse them before writing new ones.
  Lay screens out with `Stack` / `Row` / `Fill` / `Section` / `Group` from `Layout.tsx`: spacing
  between siblings comes from `gap` with a `theme.spacing` key, never from margins or raw numbers.
- `src/db/` is the SQLite layer: `migrations.ts` (append, never edit) and one file per table.
  Weights are stored in kilograms; convert with `src/features/workout/format.ts`.
- Motion is reanimated springs; every animated component checks `useReducedMotion()`.
- `src/purchases/` is the only module that talks to RevenueCat. Screens call
  `getEntitlement()`, `purchase()`, `restore()`.
- `src/state/appState.ts` is the tiny persisted store the root layout routes on.

## Rules

- Expo APIs change every release. Check `node_modules/<package>/build/*.d.ts` or
  https://docs.expo.dev/versions/v58.0.0/ rather than memory.
- `ios/` and `android/` are generated. Configure native behaviour in `app.json`.
- RevenueCat needs a development build (`npx expo run:ios`); Expo Go uses the mock paywall.
- No TODO comments, placeholder text, or unused code in finished work.
