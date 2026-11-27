import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { Icon, type IconName } from '@/components';
import { useTheme } from '@/theme/theme';

function tabIcon(name: IconName) {
  return ({ color }: { color: ColorValue; size: number }) => (
    <Icon name={name} size={24} color={typeof color === 'string' ? color : undefined} />
  );
}

export default function TabsLayout() {
  const { colors, typography } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentText,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: typography.tabLabel,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Week', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="routines" options={{ title: 'Routines', tabBarIcon: tabIcon('routines') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('history') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings') }} />
    </Tabs>
  );
}
