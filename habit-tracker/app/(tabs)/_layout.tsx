import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { Icon, type IconName } from '@/components';
import { typography, useTheme } from '@/theme/theme';

function tabIcon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => <Icon name={name} size={size - 2} color={color} />;
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarLabelStyle: typography.tabLabel,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: tabIcon('today') }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: tabIcon('progress') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings') }} />
    </Tabs>
  );
}
