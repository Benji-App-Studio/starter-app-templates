import { Redirect, useLocalSearchParams } from 'expo-router';

import { RoutineEditorScreen } from '@/features/routines/RoutineEditorScreen';

/** `/routine/new` creates a routine; `/routine/12` edits one. */
export default function RoutineRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (id === 'new') {
    return <RoutineEditorScreen />;
  }
  const routineId = Number(id);
  if (!Number.isInteger(routineId)) {
    return <Redirect href="/routines" />;
  }
  return <RoutineEditorScreen routineId={routineId} />;
}
