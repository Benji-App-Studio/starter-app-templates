import { Stack } from 'expo-router';

import { useTheme } from '@/theme/theme';

/** The sheet for logging and editing fasts. Presented as a form sheet by the root layout. */
export default function FastLayout() {
  const { colors } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
