import { AppState } from 'react-native';

import { createSession } from '@/db/sessions';

import { focusSettingsStore, getFocusSettings } from './focusSettings';
import { cancelNotification, hasNotificationPermission, scheduleEndNotification } from './notifications';
import { createPersistedStore, usePersistedStore } from './persistedStore';

export type Phase = 'focus' | 'break';

type Active = {
  phase: Phase;
  label: string;
  /** Planned length of this phase. */
  minutes: number;
  startedAt: number;
};

export type TimerState =
  | { status: 'idle' }
  | (Active & { status: 'running'; endsAt: number; notificationId?: string })
  | (Active & { status: 'paused'; remainingMs: number })
  /** A focus session just finished and was saved; the break has not started. */
  | { status: 'done'; label: string; minutes: number; breakMinutes: number };

const MINUTE_MS = 60_000;

/**
 * The timer keeps the moment a phase ends, not a tick count, so it stays
 * right when the app is backgrounded or killed: on return, `settle()` compares
 * the end time with the clock and records whatever finished meanwhile.
 */
const store = createPersistedStore<TimerState>('focus-timer/v1', { status: 'idle' });

let ticker: ReturnType<typeof setInterval> | undefined;

function syncTicker(state: TimerState) {
  if (state.status === 'running' && !ticker) {
    ticker = setInterval(() => void settle(), 1000);
  } else if (state.status !== 'running' && ticker) {
    clearInterval(ticker);
    ticker = undefined;
  }
}

function set(state: TimerState) {
  store.set(state);
  syncTicker(state);
}

AppState.addEventListener('change', (status) => {
  if (status === 'active') {
    void settle();
  }
});

async function begin(active: Active, remainingMs: number) {
  const endsAt = Date.now() + remainingMs;
  set({ ...active, status: 'running', endsAt });
  if (getFocusSettings().alerts && (await hasNotificationPermission())) {
    const notificationId = await scheduleEndNotification(active.phase, active.label, endsAt);
    const current = store.get();
    // Only attach the id if this exact run is still going.
    if (current.status === 'running' && current.endsAt === endsAt) {
      set({ ...current, notificationId });
    } else {
      cancelNotification(notificationId);
    }
  }
}

/** Record a finished phase. Idempotent: a second call finds nothing running. */
async function settle() {
  const state = store.get();
  if (state.status !== 'running' || Date.now() < state.endsAt) {
    return;
  }
  if (state.phase === 'break') {
    set({ status: 'idle' });
    return;
  }
  set({
    status: 'done',
    label: state.label,
    minutes: state.minutes,
    breakMinutes: getFocusSettings().breakMinutes,
  });
  await createSession({
    label: state.label,
    minutes: state.minutes,
    startedAt: state.startedAt,
    endedAt: state.endsAt,
  });
}

export const timer = {
  /** Read the saved timer and catch up on anything that ended while the app was closed. */
  async hydrate() {
    await Promise.all([store.hydrate(), focusSettingsStore.hydrate()]);
    syncTicker(store.get());
    await settle();
  },

  start(label: string, minutes: number) {
    return begin({ phase: 'focus', label, minutes, startedAt: Date.now() }, minutes * MINUTE_MS);
  },

  startBreak() {
    const state = store.get();
    if (state.status !== 'done') {
      return Promise.resolve();
    }
    return begin(
      { phase: 'break', label: state.label, minutes: state.breakMinutes, startedAt: Date.now() },
      state.breakMinutes * MINUTE_MS,
    );
  },

  pause() {
    const state = store.get();
    if (state.status !== 'running') {
      return;
    }
    cancelNotification(state.notificationId);
    const { endsAt: _endsAt, notificationId: _id, ...active } = state;
    set({ ...active, status: 'paused', remainingMs: Math.max(0, state.endsAt - Date.now()) });
  },

  resume() {
    const state = store.get();
    if (state.status !== 'paused') {
      return Promise.resolve();
    }
    const { remainingMs, ...active } = state;
    return begin({ ...active, phase: state.phase }, remainingMs);
  },

  /** Abandon the running phase. A stopped focus session is not saved. */
  stop() {
    const state = store.get();
    if (state.status === 'running') {
      cancelNotification(state.notificationId);
    }
    set({ status: 'idle' });
  },

  /** Back to the dial, keeping nothing. */
  async reset() {
    timer.stop();
    await store.reset();
  },
};

export function useTimer(): { state: TimerState; hydrated: boolean } {
  const { value, hydrated } = usePersistedStore(store);
  return { state: value, hydrated };
}

/** Milliseconds left in the current phase, or undefined when nothing is counting. */
export function remainingMs(state: TimerState, now: number): number | undefined {
  switch (state.status) {
    case 'running':
      return Math.max(0, state.endsAt - now);
    case 'paused':
      return state.remainingMs;
    default:
      return undefined;
  }
}
