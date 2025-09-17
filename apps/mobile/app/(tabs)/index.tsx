import { useDashboard } from '@/src/hooks';
import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { FeedbackSystem, useFeedback } from '../../src/components/feedback/FeedbackSystem';
import {
  OfflineBanner,
  DashboardHeader,
  WelcomeBanner,
  PriorityAlerts,
  ApplicationStatus,
  StatsOverview,
  QuickActionsGrid,
  RecentActivityList,
  HealthCardStatus,
} from '../../src/components/dashboard';
import { useNetwork } from '../../src/hooks/useNetwork';
import { styles } from '../../src/styles/screens/tabs-dashboard';

export default function Dashboard() {
  const {
    user, 
    userProfile,
    userApplications,
    dashboardStats,
    recentActivities,
    currentTime,
    unreadNotificationsCount,
    isLoading,
    refreshing,
    onRefresh,
    getGreeting,
    getJobCategoryById 
  } = useDashboard();

  const { messages, dismissFeedback } = useFeedback();
  const { isOnline } = useNetwork();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  // Derive computed values
  const currentApplication = userApplications?.find((app: any) => 
    app.status === 'Submitted' || app.status === 'Under Review' || app.status === 'Approved'
  );
  
  const isNewUser = (!userApplications || userApplications.length === 0) && dashboardStats.validHealthCards === 0;
  

  return (
    <View style={styles.container}>
      <OfflineBanner isOnline={isOnline} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: 50, // Space for tab bar + extra padding
          flexGrow: 1
        }}
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
      <FeedbackSystem messages={messages} onDismiss={dismissFeedback} />
    </View>
  );
}
