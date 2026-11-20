import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useStore } from '../../src/store';
import { colors } from '../../src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icon = (name: IconName, focusedName: IconName) =>
  ({ color, focused, size }: { color: string; focused: boolean; size: number }) =>
    <Ionicons name={focused ? focusedName : name} size={size} color={color} />;

export default function TabsLayout() {
  const { profile } = useStore();
  const isLeiding = profile.role === 'leiding';

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.blue },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Planner', tabBarIcon: icon('calendar-outline', 'calendar') }} />
      <Tabs.Screen name="chats" options={{ title: 'Chats', tabBarIcon: icon('chatbubbles-outline', 'chatbubbles') }} />
      <Tabs.Screen name="bestanden" options={{ title: 'Bestanden', tabBarIcon: icon('folder-outline', 'folder') }} />
      <Tabs.Screen
        name="leiding"
        options={{
          title: 'Leiding',
          href: isLeiding ? undefined : null,
          tabBarIcon: icon('shield-outline', 'shield-checkmark'),
        }}
      />
      <Tabs.Screen name="profiel" options={{ title: 'Profiel', tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
  );
}
