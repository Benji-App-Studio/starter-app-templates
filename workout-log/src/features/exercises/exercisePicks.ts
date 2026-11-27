import type { Exercise } from '@/db/exercises';

type Listener = (exercises: Exercise[]) => void;

let listener: Listener | undefined;

/**
 * Hands the exercises chosen in the picker sheet back to the screen that opened it.
 * Routes cannot pass functions as params, so the opener listens and the picker publishes once.
 */
export const exercisePicks = {
  listen(next: Listener): () => void {
    listener = next;
    return () => {
      if (listener === next) {
        listener = undefined;
      }
    };
  },
  publish(exercises: Exercise[]) {
    listener?.(exercises);
  },
};
