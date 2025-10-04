// Dashboard Widget - Composes dashboard features into a cohesive UI
import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { 
  DashboardHeader,
  OfflineBanner,
  WelcomeBanner,
  PriorityAlerts,
  ApplicationStatus,
  StatsOverview,
  QuickActionsGrid,
  RecentActivityList,
  HealthCardStatus
} from '@features/dashboard/components';
import { styles } from './DashboardWidget.styles';

interface DashboardWidgetProps {
  data: {
    user: any;
    userProfile: any;
    userApplications: any;
    dashboardStats: any;
    recentActivities: any;
    currentTime: Date;
    unreadNotificationsCount: number;
    isLoading: boolean;
    refreshing: boolean;
    currentApplication: any;
    isNewUser: boolean;
  };
  handlers: {
    onRefresh: () => void;
    getGreeting: () => string;
  };
  isOnline: boolean;
}

export function DashboardWidget({ data, handlers, isOnline }: DashboardWidgetProps) {
  const {
    userProfile,
    dashboardStats,
    recentActivities,
    currentTime,
    unreadNotificationsCount,
    refreshing,
    currentApplication,
    isNewUser,
    userApplications
  } = data;
  
  const { onRefresh, getGreeting } = handlers;

  return (
    <View style={styles.container}>
      <OfflineBanner isOnline={isOnline} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        testID="dashboard-scroll-view"
      >
        <DashboardHeader
          userProfile={userProfile}
          greeting={getGreeting()}
          currentTime={currentTime}
          unreadNotificationsCount={unreadNotificationsCount}
        />

        <WelcomeBanner isNewUser={isNewUser} />
        
        <PriorityAlerts
          dashboardStats={dashboardStats}
          currentApplication={currentApplication}
        />
        
        <ApplicationStatus currentApplication={currentApplication} />

        <StatsOverview
          dashboardStats={dashboardStats}
          currentApplication={currentApplication}
          showForNewUser={isNewUser}
        />
        
        <QuickActionsGrid
          userApplications={userApplications}
          dashboardStats={dashboardStats}
          currentApplication={currentApplication}
        />
        
        <RecentActivityList recentActivities={recentActivities} />
        
        <HealthCardStatus dashboardStats={dashboardStats} />
      </ScrollView>
    </View>
  );
}
