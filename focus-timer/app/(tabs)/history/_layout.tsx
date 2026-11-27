import { Stack } from 'expo-router';

import { useTabStackOptions } from '@/features/focus/largeTitle';

export default function TabStackLayout() {
  return <Stack screenOptions={useTabStackOptions()} />;
}
