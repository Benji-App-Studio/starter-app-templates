import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useSyncExternalStore } from 'react';

import { createSession } from '@/db/sessions';
import { appState } from '@/state/appState';

import { soundById, type MixSound, type SoundId } from './sounds';

export type MixerState = {
  /** The sounds in the mix, in the order they were added. */
  sounds: MixSound[];
  playing: boolean;
  /** Minutes until the fade-out ends, or null to play until stopped. */
  timerMinutes: number | null;
  /** Unix time when the mix falls silent, while playing with a timer. */
  endsAt: number | null;
  /** Seconds left on the timer, while playing with a timer. */
  remainingSeconds: number | null;
};

export const DEFAULT_VOLUME = 0.7;
export const MIN_VOLUME = 0.1;
/** A stretch shorter than this is a false start, not a night, and is not logged. */
const MIN_LOGGED_SESSION_MS = 60_000;
const TICK_MS = 1000;

let state: MixerState = {
  sounds: [],
  playing: false,
  timerMinutes: appState.get().timerMinutes,
  endsAt: null,
  remainingSeconds: null,
};

const players = new Map<SoundId, AudioPlayer>();
const listeners = new Set<() => void>();
let tick: ReturnType<typeof setInterval> | undefined;
let sessionStartedAt: number | null = null;
let audioModeReady: Promise<void> | undefined;
let seeded = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function set(patch: Partial<MixerState>) {
  state = { ...state, ...patch };
  emit();
}

function ensureAudioMode() {
  audioModeReady ??= setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'doNotMix',
  });
  return audioModeReady;
}

function playerFor(entry: MixSound): AudioPlayer {
  let player = players.get(entry.id);
  if (!player) {
    player = createAudioPlayer(soundById[entry.id].source);
    player.loop = true;
    players.set(entry.id, player);
  }
  player.volume = entry.volume;
  return player;
}

/** During the fade-out every sound sits at `factor` of its own level. */
function applyLevels(factor: number) {
  for (const entry of state.sounds) {
    const player = players.get(entry.id);
    if (player) {
      player.volume = entry.volume * factor;
    }
  }
}

function endSession(endedAt: number) {
  if (sessionStartedAt === null) {
    return;
  }
  const startedAt = sessionStartedAt;
  sessionStartedAt = null;
  if (endedAt - startedAt >= MIN_LOGGED_SESSION_MS) {
    void createSession({
      startedAt,
      endedAt,
      timerMinutes: state.timerMinutes,
      sounds: state.sounds,
    }).catch((error: unknown) => console.warn('Could not log the night', error));
  }
}

function stopTick() {
  if (tick) {
    clearInterval(tick);
    tick = undefined;
  }
}

function onTick() {
  if (state.endsAt === null) {
    return;
  }
  const remainingMs = state.endsAt - Date.now();
  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const { fadeSeconds } = appState.get();
  applyLevels(Math.min(1, remainingSeconds / fadeSeconds));
  if (remainingSeconds <= 0) {
    mixer.pause();
    return;
  }
  set({ remainingSeconds });
}

function startTick() {
  stopTick();
  if (state.endsAt !== null) {
    tick = setInterval(onTick, TICK_MS);
    onTick();
  }
}

export const mixer = {
  get: () => state,

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Add a sound at the default level, or take it out of the mix. */
  toggle(id: SoundId) {
    const existing = state.sounds.find((entry) => entry.id === id);
    if (existing) {
      players.get(id)?.remove();
      players.delete(id);
      set({ sounds: state.sounds.filter((entry) => entry.id !== id) });
      return;
    }
    const entry = { id, volume: DEFAULT_VOLUME };
    set({ sounds: [...state.sounds, entry] });
    if (state.playing) {
      playerFor(entry).play();
    }
  },

  setVolume(id: SoundId, volume: number) {
    const clamped = Math.min(1, Math.max(MIN_VOLUME, volume));
    set({
      sounds: state.sounds.map((entry) => (entry.id === id ? { ...entry, volume: clamped } : entry)),
    });
    const player = players.get(id);
    if (player) {
      player.volume = clamped;
    }
  },

  setTimer(timerMinutes: number | null) {
    const endsAt = state.playing && timerMinutes !== null ? Date.now() + timerMinutes * 60_000 : null;
    set({ timerMinutes, endsAt, remainingSeconds: null });
    if (state.playing) {
      applyLevels(1);
      startTick();
    }
  },

  /** The first time the mixer opens in this launch, start from the plan onboarding built. */
  seed(sounds: MixSound[], timerMinutes: number | null) {
    if (seeded) {
      return;
    }
    seeded = true;
    if (state.sounds.length === 0) {
      mixer.load(sounds, timerMinutes);
    }
  },

  /** Replace the whole mix, e.g. from a saved mix. Keeps playing if it was playing. */
  load(sounds: MixSound[], timerMinutes: number | null) {
    for (const [id, player] of players) {
      if (!sounds.some((entry) => entry.id === id)) {
        player.remove();
        players.delete(id);
      }
    }
    set({ sounds });
    if (state.playing) {
      sounds.forEach((entry) => playerFor(entry).play());
    }
    mixer.setTimer(timerMinutes);
  },

  async play() {
    if (state.sounds.length === 0 || state.playing) {
      return;
    }
    await ensureAudioMode();
    state.sounds.forEach((entry) => playerFor(entry).play());
    sessionStartedAt = Date.now();
    const endsAt = state.timerMinutes === null ? null : Date.now() + state.timerMinutes * 60_000;
    set({ playing: true, endsAt });
    startTick();
  },

  pause() {
    if (!state.playing) {
      return;
    }
    stopTick();
    players.forEach((player) => player.pause());
    applyLevels(1);
    endSession(Date.now());
    set({ playing: false, endsAt: null, remainingSeconds: null });
  },

  clear() {
    mixer.pause();
    players.forEach((player) => player.remove());
    players.clear();
    set({ sounds: [] });
  },
};

export function useMixer(): MixerState {
  return useSyncExternalStore(mixer.subscribe, mixer.get, mixer.get);
}
