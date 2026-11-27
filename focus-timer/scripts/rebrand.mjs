#!/usr/bin/env node
// Renames the app in one command. Run from the app folder:
//   node scripts/rebrand.mjs --name "Habit Pal" --slug habit-pal --bundle com.yourname.habitpal --color "#0EA5E9"
// Every flag is optional; only the given ones change.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = parseArgs(process.argv.slice(2));

if (Object.keys(args).length === 0) {
  console.log(
    'Usage: node scripts/rebrand.mjs --name "App Name" --slug app-slug --bundle com.company.app --color "#RRGGBB"',
  );
  process.exit(1);
}

validate(args);

const changes = [];
const appJsonPath = resolve(root, 'app.json');
const appJson = JSON.parse(readFileSync(appJsonPath, 'utf8'));

if (args.name) {
  appJson.expo.name = args.name;
  changes.push(`app name → ${args.name}`);
}
if (args.slug) {
  appJson.expo.slug = args.slug;
  appJson.expo.scheme = args.slug.replace(/[^a-z0-9]/gi, '').toLowerCase();
  changes.push(`slug → ${args.slug} (scheme ${appJson.expo.scheme})`);

  const packageJsonPath = resolve(root, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  packageJson.name = args.slug;
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}
if (args.bundle) {
  appJson.expo.ios.bundleIdentifier = args.bundle;
  appJson.expo.android.package = args.bundle;
  changes.push(`bundle id / package → ${args.bundle}`);
}
if (args.color) {
  const color = args.color.toUpperCase();
  appJson.expo.android.adaptiveIcon.backgroundColor = color;

  const themePath = resolve(root, 'src/theme/theme.ts');
  const theme = readFileSync(themePath, 'utf8');
  const next = theme.replace(/PRIMARY_COLOR = '#[0-9A-Fa-f]{6}'/, `PRIMARY_COLOR = '${color}'`);
  if (next === theme) {
    fail('Could not find PRIMARY_COLOR in src/theme/theme.ts');
  }
  writeFileSync(themePath, next);
  changes.push(`primary color → ${color}`);
}

writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`);

console.log(changes.map((change) => `✔ ${change}`).join('\n'));
console.log('\nNext: replace the images in assets/ (icon, splash, Android icon layers), then run npx expo start.');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (!flag.startsWith('--') || value === undefined || value.startsWith('--')) {
      fail(`Expected a value after ${flag}`);
    }
    out[flag.slice(2)] = value;
    i += 1;
  }
  return out;
}

function validate({ name, slug, bundle, color, ...unknown }) {
  const extra = Object.keys(unknown);
  if (extra.length > 0) {
    fail(`Unknown flag(s): ${extra.map((flag) => `--${flag}`).join(', ')}`);
  }
  if (name !== undefined && name.trim().length === 0) {
    fail('--name cannot be empty');
  }
  if (slug !== undefined && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    fail('--slug must be lowercase letters, digits and dashes, e.g. habit-pal');
  }
  if (bundle !== undefined && !/^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/.test(bundle)) {
    fail('--bundle must look like com.company.app (letters and digits, dot separated)');
  }
  if (color !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    fail('--color must be a 6-digit hex color like "#0EA5E9"');
  }
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}
