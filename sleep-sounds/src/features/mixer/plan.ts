import { describeMix, type MixSound } from './sounds';

export type NightPlan = {
  sounds: MixSound[];
  /** Minutes before the fade-out, or null to play all night. */
  timerMinutes: number | null;
  /** "Rain + Brown noise" */
  title: string;
  /** How each answer shaped the plan, one line per answer, shown while the plan is built. */
  reasons: string[];
};

const startingMixes: Record<string, MixSound[]> = {
  rain: [
    { id: 'rain', volume: 0.8 },
    { id: 'brown-noise', volume: 0.35 },
  ],
  steady: [
    { id: 'pink-noise', volume: 0.7 },
    { id: 'fan', volume: 0.4 },
  ],
  deep: [
    { id: 'brown-noise', volume: 0.8 },
    { id: 'low-drone', volume: 0.35 },
  ],
  nature: [
    { id: 'ocean', volume: 0.8 },
    { id: 'wind', volume: 0.4 },
  ],
};

/** Minutes of play for each answer, with room beyond the time the user says they need. */
const soundReasons: Record<string, string> = {
  rain: 'Rain up front, brown noise underneath to fill the gaps',
  steady: 'Pink noise for an even room, a fan for texture',
  deep: 'Brown noise for weight, a drone to round it off',
  nature: 'Slow ocean swells with wind moving over them',
};

const goalReasons: Record<string, string> = {
  'fall-asleep': 'A fade-out, so the room is quiet once you are asleep',
  'stay-asleep': 'No timer: it plays softly until morning so a waking moment stays covered',
  'block-noise': 'White noise added to cover traffic and voices',
  'wind-down': 'Soft levels, gentle enough to read or rest to',
};

const timers: Record<string, number> = {
  quick: 30,
  'half-hour': 45,
  hour: 75,
  longer: 90,
};

/** Turn the onboarding answers into the first mix and timer. */
export function buildNightPlan(answers: Record<string, string>): NightPlan {
  const goal = answers.goal ?? 'fall-asleep';
  const base = startingMixes[answers.sounds ?? 'rain'] ?? startingMixes.rain;
  // Winding down is listening while awake, so the levels sit a quarter lower.
  const sounds = base.map((sound) => (goal === 'wind-down' ? { ...sound, volume: Math.round(sound.volume * 75) / 100 } : { ...sound }));

  if (goal === 'block-noise' && !sounds.some((sound) => sound.id === 'white-noise')) {
    // Masking needs energy in the higher band, which only white noise carries.
    sounds.push({ id: 'white-noise', volume: 0.5 });
  }

  const timerMinutes = goal === 'stay-asleep' ? null : (timers[answers.fallAsleepTime ?? ''] ?? 45);
  const title = describeMix(sounds);

  const reasons = [soundReasons[answers.sounds ?? 'rain'] ?? soundReasons.rain, goalReasons[goal] ?? goalReasons['fall-asleep']];
  if (timerMinutes !== null) {
    reasons.push(`${timerMinutes} minutes of play, with room past the time you take to drift off`);
  }

  return {
    sounds,
    timerMinutes,
    title,
    reasons,
  };
}
