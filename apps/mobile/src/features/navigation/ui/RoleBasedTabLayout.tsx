import { getColor } from '@shared/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from 'convex/react';
import { Tabs } from 'expo-router';
import React from 'react';
import { moderateScale, verticalScale } from '@shared/utils/responsive';
import { api } from '@backend/convex/_generated/api';
import { useRoleBasedNavigation } from '../hooks';
import { LoadingSpinner } from '@shared/components/feedback/LoadingSpinner';
import ApplicantTabBar from '../components/ApplicantTabBar';

export default function RoleBasedTabLayout() {
  const userProfile = useQuery(api.users.getCurrentUser.getCurrentUserQuery);
  const { visibleTabs } = useRoleBasedNavigation(userProfile?.role);

  // Show loading state while user profile is fetching or being initialized
  if (userProfile === undefined || userProfile === null) {
    return (
      <LoadingSpinner 
        visible={true} 
        message="Loading..." 
        fullScreen 
        type="pulse" 
        icon="compass" 
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
      }}
      tabBar={(props) => <ApplicantTabBar {...props} />}
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
