import React from 'react'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@/src/styles/theme';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{tabBarShowLabel : false,
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.gray[400],
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          height: 58,
          paddingBottom: 8,
          backgroundColor: theme.colors.ui.white,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.light,
          elevation: 5,
          shadowColor: theme.colors.ui.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen name="index"
        options={{
          tabBarIcon: ({size, color}) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="application"
        options={{
          tabBarIcon: ({size, color}) => <Ionicons name="document-text" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="apply"
        options={{
          tabBarIcon: ({size}) => <Ionicons name="add-circle" size={size} color={theme.colors.primary[500]} />,
        }}
      />
      <Tabs.Screen name="notification"
        options={{
          tabBarIcon: ({size, color}) => <Ionicons name="notifications" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="profile"
        options={{
          tabBarIcon: ({size, color}) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}