import { Stack } from 'expo-router';

import { HistoryScreen } from '@/features/focus/HistoryScreen';

export default function HistoryRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'History' }} />
      <HistoryScreen />
    </>
  );
}
