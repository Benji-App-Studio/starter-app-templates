import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { Icon, type IconName } from '@/components';
import { useTheme } from '@/theme/theme';

function tabIcon(name: IconName, fallback: string) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Icon name={name} size={size - 2} color={typeof color === 'string' ? color : fallback} />
  );
}

export default function TabsLayout() {
  const { colors, typography } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarLabelStyle: typography.micro,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Timer', tabBarIcon: tabIcon('timer', colors.textMuted) }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('history', colors.textMuted) }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings', colors.textMuted) }} />
    </Tabs>
  );
}
