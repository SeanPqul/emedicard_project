import { getColor } from '@shared/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from 'convex/react';
import { Tabs } from 'expo-router';
import React from 'react';
import { api } from '@backend/convex/_generated/api';
import { useRoleBasedNavigation } from '../hooks';
import { LoadingSpinner } from '@shared/components/feedback/LoadingSpinner';

export default function RoleBasedTabLayout() {
  const userProfile = useQuery(api.users.getCurrentUser.getCurrentUserQuery);
  const { visibleTabs } = useRoleBasedNavigation(userProfile?.role);

  // Show loading while user profile is being fetched
  if (userProfile === undefined) {
    return (
      <LoadingSpinner 
        visible={true} 
        message="Loading navigation..." 
        fullScreen 
        type="pulse" 
        icon="compass" 
      />
    );
  }

  // Handle error case when user profile fails to load
  if (userProfile === null) {
    return (
      <LoadingSpinner 
        visible={true} 
        message="Unable to load user data..." 
        fullScreen 
        type="pulse" 
        icon="warning" 
      />
    );
  }

  return (
    <Tabs 
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: getColor('green.500') || '#10B981',
        tabBarInactiveTintColor: getColor('gray.400') || '#9CA3AF',
        tabBarStyle: {
          height: 50,
          paddingTop: 6,
          paddingBottom: 0,
          paddingHorizontal: 0,
          backgroundColor: getColor('ui.white') || '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: getColor('border.light') || '#E5E7EB',
          elevation: 0,
          shadowOpacity: 0,
          minHeight: 50,
          maxHeight: 50,
        },
      }}
    >
      {visibleTabs.map((tab) => (
        <Tabs.Screen 
          key={tab.name}
          name={tab.name}
          options={{
            tabBarIcon: ({ size, color }) => (
              <Ionicons 
                name={tab.icon as any} 
                size={size} 
                color={tab.name === 'apply' ? (getColor('green.500') || '#10B981') : color} 
              />
            ),
            tabBarStyle: tab.visible ? undefined : { display: 'none' },
          }}
        />
      ))}
      
      {/* Hide tabs that are not visible for the current role */}
      {/* Only hide/show existing route files */}
    </Tabs>
  );
}
