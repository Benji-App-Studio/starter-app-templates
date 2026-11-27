import type { AudioSource } from 'expo-audio';

import type { IconName } from '@/components/icons';

export type SoundId =
  | 'rain'
  | 'ocean'
  | 'wind'
  | 'white-noise'
  | 'pink-noise'
  | 'brown-noise'
  | 'fan'
  | 'low-drone';

export type Sound = {
  id: SoundId;
  name: string;
  icon: IconName;
  /** The color this sound lends to the blob when it is in the mix. */
  tint: string;
  source: AudioSource;
};

/**
 * The bundled library. Every loop is synthesized by `scripts/make-sounds.sh`
 * (24 s, mono AAC, seamless), so there is nothing to license.
 */
export const sounds: Sound[] = [
  { id: 'rain', name: 'Rain', icon: 'rain', tint: '#6D8CFF', source: require('../../../assets/sounds/rain.m4a') },
  { id: 'ocean', name: 'Ocean', icon: 'waves', tint: '#4FC3C7', source: require('../../../assets/sounds/ocean.m4a') },
  { id: 'wind', name: 'Wind', icon: 'wind', tint: '#9AA7D9', source: require('../../../assets/sounds/wind.m4a') },
  { id: 'white-noise', name: 'White noise', icon: 'waveform', tint: '#B9B3E6', source: require('../../../assets/sounds/white-noise.m4a') },
  { id: 'pink-noise', name: 'Pink noise', icon: 'waveformPath', tint: '#E3A3D2', source: require('../../../assets/sounds/pink-noise.m4a') },
  { id: 'brown-noise', name: 'Brown noise', icon: 'mountains', tint: '#C98A5A', source: require('../../../assets/sounds/brown-noise.m4a') },
  { id: 'fan', name: 'Fan', icon: 'fan', tint: '#8FA3B8', source: require('../../../assets/sounds/fan.m4a') },
  { id: 'low-drone', name: 'Low drone', icon: 'tuningFork', tint: '#8A7CFF', source: require('../../../assets/sounds/low-drone.m4a') },
];

export const soundById = Object.fromEntries(sounds.map((sound) => [sound.id, sound])) as Record<
  SoundId,
  Sound
>;

/** One sound in a mix with its level, 0.1..1. */
export type MixSound = { id: SoundId; volume: number };

/** "Rain + Brown noise", the way a mix is referred to everywhere. */
export function describeMix(mix: MixSound[]): string {
  const names = sounds.filter((sound) => mix.some((entry) => entry.id === sound.id)).map((s) => s.name);
  if (names.length === 0) {
    return 'No sounds';
  }
  if (names.length <= 2) {
    return names.join(' + ');
  }
  if (names.length === 3) {
    return `${names[0]}, ${names[1]} + ${names[2]}`;
  }
  return `${names[0]}, ${names[1]} + ${names.length - 2} more`;
}
