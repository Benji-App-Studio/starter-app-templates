import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, type ColorValue } from 'react-native';

import { Icon, TAB_BAR_HEIGHT, type IconName } from '@/components';
import { useTheme } from '@/theme/theme';

function tabIcon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Icon name={name} size={size} color={typeof color === 'string' ? color : '#000000'} />
  );
}

export default function TabsLayout() {
  const { colors, scheme, typography } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: typography.caption.fontFamily, fontSize: 11 },
        tabBarStyle: {
          position: 'absolute',
          height: undefined,
          minHeight: TAB_BAR_HEIGHT,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={scheme === 'dark' ? 60 : 80}
            tint={scheme === 'dark' ? 'systemUltraThinMaterialDark' : 'systemUltraThinMaterialLight'}
            style={StyleSheet.absoluteFill}
          />
        ),
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Mix', tabBarIcon: tabIcon('moon') }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: tabIcon('bookmark') }} />
      <Tabs.Screen name="nights" options={{ title: 'Nights', tabBarIcon: tabIcon('chart') }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: tabIcon('settings') }} />
    </Tabs>
  );
}
