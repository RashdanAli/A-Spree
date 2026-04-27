import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: '#8f8f8f',
        headerStyle: {
          backgroundColor: '#f7fafd',
        },
        headerTintColor: '#1b1c1c',
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: 'rgba(0,0,0,0.05)',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerTitle: 'A-Spree',
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} />,
          headerTitle: 'My Orders',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}