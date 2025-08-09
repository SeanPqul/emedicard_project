import { theme } from '@/src/styles/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from 'convex/react';
import { Tabs } from 'expo-router';
import React from 'react';
import { api } from '../../../convex/_generated/api';
import { useRoleBasedNavigation } from '../../hooks/useRoleBasedNavigation';
import { LoadingSpinner } from '../LoadingSpinner';

export default function RoleBasedTabLayout() {
  const userProfile = useQuery(api["users/getCurrent"].getCurrentUser);
  const { visibleTabs } = useRoleBasedNavigation(userProfile?.role);

  if (!userProfile) {
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

  return (
    <Tabs 
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.gray[400],
        tabBarStyle: {
          height: 50,
          paddingTop: 6,
          paddingBottom: 0,
          paddingHorizontal: 0,
          backgroundColor: theme.colors.ui.white,
          borderTopWidth: 0.5,
          borderTopColor: theme.colors.border.light,
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
                color={tab.name === 'apply' ? theme.colors.primary[500] : color} 
              />
            ),
            tabBarStyle: tab.visible ? undefined : { display: 'none' },
          }}
        />
      ))}
      
      {/* Hide tabs that are not visible for the current role */}
      {/* Admin functionality is handled via web interface, not mobile app */}
      
      {!visibleTabs.find(tab => tab.name === 'inspectorDashboard') && (
        <Tabs.Screen 
          name="inspectorDashboard"
          options={{
            href: null,
          }}
        />
      )}
      
      {!visibleTabs.find(tab => tab.name === 'reviewApplications') && (
        <Tabs.Screen 
          name="reviewApplications"
          options={{
            href: null,
          }}
        />
      )}
      
      {/* Hide old hyphenated routes */}
      <Tabs.Screen 
        name="inspector-dashboard"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen 
        name="review-applications"
        options={{
          href: null,
        }}
      />
      
      {!visibleTabs.find(tab => tab.name === 'inspection-queue') && (
        <Tabs.Screen 
          name="inspection-queue"
          options={{
            href: null,
          }}
        />
      )}
      
      {!visibleTabs.find(tab => tab.name === 'scanner') && (
        <Tabs.Screen 
          name="scanner"
          options={{
            href: null,
          }}
        />
      )}
    </Tabs>
  );
}
