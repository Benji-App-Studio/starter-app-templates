import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts,
} from '@expo-google-fonts/dm-sans';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { preferences } from '@/features/expenses/preferences';
import { configurePurchases, getEntitlement } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

void SplashScreen.preventAutoHideAsync();

async function bootstrap() {
  // Preferences carry the theme choice, so they load before the first frame.
  await Promise.all([appState.hydrate(), preferences.ready()]);
  configurePurchases();
  // The cached entitlement routes the first frame; the store answer may update it.
  await getEntitlement().catch(() => undefined);
}

/**
 * Root layout. Picks the screen from the persisted app state:
 * first launch → onboarding, onboarding done → paywall until entitled → tabs.
 * Guards flip the route automatically when the state changes.
 */
export default function RootLayout() {
  const { colors, scheme } = useTheme();
  const { hydrated, onboardingDone, entitled } = useAppState();
  const [fontsLoaded, fontError] = useFonts({
    DMSerifDisplay_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const ready = hydrated && (fontsLoaded || fontError !== null);

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  const sheet = {
    presentation: 'formSheet',
    sheetAllowedDetents: 'fitToContents',
    sheetGrabberVisible: true,
    sheetCornerRadius: 28,
    contentStyle: { backgroundColor: colors.surface },
  } as const;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={!onboardingDone}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
        <Stack.Protected guard={onboardingDone && !entitled}>
          <Stack.Screen name="paywall" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Protected guard={onboardingDone && entitled}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="expense" options={sheet} />
          <Stack.Screen name="budget" options={sheet} />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
