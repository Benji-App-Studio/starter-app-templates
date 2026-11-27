# Notes for AI coding agents

This is an Expo (SDK 58) + Expo Router + TypeScript app. Read `README.md` first, then the
rules in `../CONTRACT.md` if this app lives inside the templates repo.

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
  real code in `src/features/<feature>/`. The fasting feature (`src/features/fasting/`) owns the
  timer, history, the fast sheet, plans, stats, preferences and notifications; `DESIGN-NOTES.md`
  explains the palette, type scale and the hold-to-start interaction.
- `src/config/` holds the copy and options a non-coder edits: onboarding steps, paywall
  text and plans, support email and legal links.
- `src/theme/theme.ts` is the only place for colors, spacing, radii and type styles.
  Use `useTheme()`; never hard-code a color in a screen.
- `src/components/` are the shared building blocks. Reuse them before writing new ones. Lay
  screens out with `Screen` (safe areas, 20 pt gutter, pinned footer), `Stack` / `Row` (gaps from
  `theme.spacing`) and `Section` (title 12 pt above content). Siblings are spaced with `gap`, never
  with margins on the children, so nothing can touch.
- `src/db/` is the SQLite layer: `migrations.ts` (append, never edit) and one file per table.
- `src/purchases/` is the only module that talks to RevenueCat. Screens call
  `getEntitlement()`, `purchase()`, `restore()`.
- `src/state/appState.ts` is the tiny persisted store the root layout routes on.

## Rules

- Expo APIs change every release. Check `node_modules/<package>/build/*.d.ts` or
  https://docs.expo.dev/versions/v58.0.0/ rather than memory.
- `ios/` and `android/` are generated. Configure native behaviour in `app.json`.
- RevenueCat needs a development build (`npx expo run:ios`); Expo Go uses the mock paywall.
- No TODO comments, placeholder text, or unused code in finished work.
