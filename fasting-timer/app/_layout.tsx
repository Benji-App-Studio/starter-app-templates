import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { configureNotifications } from '@/features/fasting/notifications';
import { preferences } from '@/features/fasting/preferences';
import { configurePurchases, getEntitlement } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { fonts, useTheme } from '@/theme/theme';

void SplashScreen.preventAutoHideAsync();

async function bootstrap() {
  await Promise.all([appState.hydrate(), preferences.hydrate()]);
  configurePurchases();
  configureNotifications();
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
  const [fontsLoaded] = useFonts(fonts);
  const ready = hydrated && fontsLoaded;

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <Stack.Screen
            name="fast"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.82],
              sheetGrabberVisible: true,
              sheetCornerRadius: 28,
            }}
          />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}
