import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

type Snapshot<T> = { hydrated: boolean; value: T };

/**
 * A tiny external store persisted to AsyncStorage, in the style of `appState`.
 * Used for the timer and the focus preferences; session data lives in SQLite.
 */
export function createPersistedStore<T>(storageKey: string, initial: T) {
  let snapshot: Snapshot<T> = { hydrated: false, value: initial };
  let hydration: Promise<void> | undefined;
  const listeners = new Set<() => void>();

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function replace(next: Snapshot<T>) {
    snapshot = next;
    emit();
  }

  return {
    get: () => snapshot.value,
    isHydrated: () => snapshot.hydrated,
    getSnapshot: () => snapshot,

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    set(value: T) {
      replace({ hydrated: snapshot.hydrated, value });
      void AsyncStorage.setItem(storageKey, JSON.stringify(value));
    },

    /** Read the saved value once; later calls reuse the first read. */
    hydrate(): Promise<void> {
      hydration ??= AsyncStorage.getItem(storageKey).then((raw) => {
        const value: T = raw ? JSON.parse(raw) : initial;
        replace({ hydrated: true, value });
      });
      return hydration;
    },

    async reset() {
      await AsyncStorage.removeItem(storageKey);
      replace({ hydrated: true, value: initial });
    },
  };
}

export type PersistedStore<T> = ReturnType<typeof createPersistedStore<T>>;

/** Subscribe to a store and make sure it has been read from disk. */
export function usePersistedStore<T>(store: PersistedStore<T>): Snapshot<T> {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    void store.hydrate();
  }, [store]);

  return snapshot;
}
