import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { Icon, type IconName } from '@/components';
import { useTimer } from '@/features/focus/timer';
import { useTheme } from '@/theme/theme';

export default function TabsLayout() {
  const { colors, typography } = useTheme();
  const { state } = useTimer();
  // While a session runs the Focus screen goes full-bleed: no tab bar to wander off to.
  const inSession = state.status === 'running' || state.status === 'paused';

  function tabIcon(name: IconName) {
    return ({ color, size }: { color: ColorValue; size: number }) => (
      <Icon name={name} size={size - 2} color={typeof color === 'string' ? color : colors.textMuted} />
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: typography.tab,
        tabBarStyle: inSession
          ? { display: 'none' }
          : { backgroundColor: colors.background, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Focus', tabBarIcon: tabIcon('timer') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('history') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings') }} />
    </Tabs>
  );
}
