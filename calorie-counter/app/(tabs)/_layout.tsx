import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { Icon, type IconName } from '@/components';
import { useTheme } from '@/theme/theme';

/** The tab bar passes its tint as a ColorValue; `fallback` covers the platform color objects. */
function tabIcon(name: IconName, fallback: string) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Icon name={name} size={size} color={typeof color === 'string' ? color : fallback} />
  );
}

export default function TabsLayout() {
  const { colors, typography } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: typography.micro,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: tabIcon('today', colors.text) }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('history', colors.text) }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings', colors.text) }} />
    </Tabs>
  );
}
