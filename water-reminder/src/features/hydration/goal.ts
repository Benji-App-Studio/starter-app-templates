export type Unit = 'ml' | 'oz';

export const ML_PER_OZ = 29.5735;
export const MIN_GOAL_ML = 1000;
export const MAX_GOAL_ML = 6000;

/** Midpoint of each weight range offered in onboarding, in kilograms. */
const WEIGHT_KG: Record<string, number> = {
  'under-55': 50,
  '55-70': 62,
  '70-85': 77,
  '85-100': 92,
  'over-100': 105,
};

/** Extra millilitres a day for activity and climate, on top of the weight-based base. */
const ACTIVITY_ML: Record<string, number> = { sitting: 0, light: 250, active: 500, intense: 750 };
const CLIMATE_ML: Record<string, number> = { cool: 0, warm: 250, hot: 500 };

const ML_PER_KG = 33;
const FALLBACK_KG = 70;

/**
 * The daily goal from the onboarding answers: about 33 ml per kilogram of body
 * weight, plus allowances for activity and climate, rounded to 50 ml.
 * Unanswered questions fall back to a 70 kg, mostly-sitting, mild-climate day.
 */
export function recommendedGoalMl(answers: Record<string, string>): number {
  const weightKg = WEIGHT_KG[answers.weight] ?? FALLBACK_KG;
  const total = weightKg * ML_PER_KG + (ACTIVITY_ML[answers.activity] ?? 0) + (CLIMATE_ML[answers.climate] ?? 0);
  return clampGoal(Math.round(total / 50) * 50);
}

export function clampGoal(ml: number): number {
  return Math.min(MAX_GOAL_ML, Math.max(MIN_GOAL_ML, Math.round(ml)));
}

export function mlToOz(ml: number): number {
  return ml / ML_PER_OZ;
}

export function ozToMl(oz: number): number {
  return Math.round(oz * ML_PER_OZ);
}

/** The number shown for an amount in the chosen unit, without the unit label. */
export function amountValue(ml: number, unit: Unit): number {
  return unit === 'oz' ? Math.round(mlToOz(ml)) : Math.round(ml);
}

/** "1,250 ml" or "42 oz". */
export function formatAmount(ml: number, unit: Unit): string {
  return `${amountValue(ml, unit).toLocaleString()} ${unit}`;
}

/** Short form for headlines: "2.75 L" / "93 oz". */
export function formatAmountShort(ml: number, unit: Unit): string {
  if (unit === 'oz') {
    return `${Math.round(mlToOz(ml))} oz`;
  }
  if (ml >= 1000) {
    const litres = ml / 1000;
    return `${Number.isInteger(litres) ? litres : litres.toFixed(2).replace(/0$/, '')} L`;
  }
  return `${Math.round(ml)} ml`;
}

export type CupPreset = {
  id: string;
  label: string;
  amountMl: number;
};

/** Quick-add sizes per unit. Oz presets are stored as their exact millilitre equivalent. */
export const cupPresets: Record<Unit, CupPreset[]> = {
  ml: [
    { id: 'small', label: 'Small glass', amountMl: 150 },
    { id: 'glass', label: 'Glass', amountMl: 250 },
    { id: 'mug', label: 'Mug', amountMl: 350 },
    { id: 'bottle', label: 'Bottle', amountMl: 500 },
    { id: 'large', label: 'Big bottle', amountMl: 750 },
  ],
  oz: [
    { id: 'small', label: 'Small glass', amountMl: ozToMl(6) },
    { id: 'glass', label: 'Glass', amountMl: ozToMl(8) },
    { id: 'mug', label: 'Mug', amountMl: ozToMl(12) },
    { id: 'bottle', label: 'Bottle', amountMl: ozToMl(16) },
    { id: 'large', label: 'Big bottle', amountMl: ozToMl(24) },
  ],
};

/** The standard glass used in copy ("about 11 glasses a day"). */
export const GLASS_ML = 250;
