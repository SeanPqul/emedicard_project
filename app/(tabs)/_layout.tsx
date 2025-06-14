import React from 'react'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '@/constant/theme';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{tabBarShowLabel : false,
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.grey,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          height: 50,
          paddingBottom: 8,
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          elevation: 0,
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
          tabBarIcon: ({size}) => <Ionicons name="add-circle" size={size} color={COLORS.primary} />,
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