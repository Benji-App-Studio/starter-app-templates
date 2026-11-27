import { Redirect, useLocalSearchParams } from 'expo-router';

import { FastEditorScreen } from '@/features/fasting/FastEditorScreen';

export default function EditFastRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const fastId = Number(id);

  if (!Number.isInteger(fastId) || fastId <= 0) {
    return <Redirect href="/" />;
  }

  return <FastEditorScreen fastId={fastId} />;
}
