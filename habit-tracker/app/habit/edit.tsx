import { useLocalSearchParams } from 'expo-router';

import { HabitEditorScreen } from '@/features/habits/HabitEditorScreen';

/** `/habit/edit` adds a habit; `/habit/edit?id=3` edits one. */
export default function HabitEditRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const habitId = id === undefined ? undefined : Number(id);

  return <HabitEditorScreen id={Number.isInteger(habitId) ? habitId : undefined} />;
}
