import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import type { Routine } from '@/db/routines';
import { deleteWorkout, getActiveWorkout } from '@/db/workouts';

import { startWorkout } from './startWorkout';

/** Starts a workout from a routine (or empty) and opens it; asks first if one is already open. */
export function useBeginWorkout() {
  const router = useRouter();

  return useCallback(
    async (routine: Routine | null) => {
      const open = () => router.push('/workout/active');
      const active = await getActiveWorkout();
      if (!active) {
        await startWorkout(routine);
        open();
        return;
      }
      Alert.alert('A workout is in progress', `${active.name} is still open. Finish it or discard it first.`, [
        { text: 'Resume', onPress: open },
        {
          text: 'Discard and start new',
          style: 'destructive',
          onPress: async () => {
            await deleteWorkout(active.id);
            await startWorkout(routine);
            open();
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [router],
  );
}
