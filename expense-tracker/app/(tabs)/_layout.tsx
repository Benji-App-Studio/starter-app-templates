import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { Icon, type IconName } from '@/components';
import { useTheme } from '@/theme/theme';

function tabIcon(name: IconName, fallback: string) {
  return ({ color }: { color: ColorValue; size: number }) => (
    <Icon name={name} size={22} color={typeof color === 'string' ? color : fallback} />
  );
}

export default function TabsLayout() {
  const { colors, typography } = useTheme();
  const muted = colors.textMuted;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: typography.tab,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: tabIcon('home', muted) }} />
      <Tabs.Screen name="budgets" options={{ title: 'Budgets', tabBarIcon: tabIcon('budgets', muted) }} />
      <Tabs.Screen name="report" options={{ title: 'Report', tabBarIcon: tabIcon('report', muted) }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings', muted) }} />
    </Tabs>
  );
}
