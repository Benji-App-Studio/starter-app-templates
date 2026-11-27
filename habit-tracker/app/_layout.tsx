import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold } from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { configurePurchases, getEntitlement } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

void SplashScreen.preventAutoHideAsync();

async function bootstrap() {
  await appState.hydrate();
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
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
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

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
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
          <Stack.Screen name="habit/[id]" />
          <Stack.Screen
            name="habit/edit"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: [0.94],
              sheetGrabberVisible: true,
              sheetCornerRadius: 28,
              contentStyle: { backgroundColor: colors.surface },
            }}
          />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}
