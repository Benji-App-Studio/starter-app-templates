import { Redirect, useLocalSearchParams } from 'expo-router';

import { HabitDetailScreen } from '@/features/habits/HabitDetailScreen';

export default function HabitDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = Number(id);

  if (!Number.isInteger(habitId)) {
    return <Redirect href="/" />;
  }

  return <HabitDetailScreen id={habitId} />;
}
