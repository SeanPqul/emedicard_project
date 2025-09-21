// DashboardScreen - Clean architecture implementation
import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { BaseScreen } from '@core/components';
import { FeedbackSystem, useFeedback } from '@shared/components/feedback/feedback';
import { useNetwork } from '@shared/hooks/useNetwork';
import { useDashboardData } from '../../hooks/useDashboardData';
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
} from '../../components';
import { styles } from './DashboardScreen.styles';
import { LoadingView } from '@shared/components';

export function DashboardScreen() {
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
    currentApplication,
    isNewUser
  } = useDashboardData();

  const { messages, dismissFeedback } = useFeedback();
  const { isOnline } = useNetwork();

  if (isLoading) {
    return (
      <LoadingView 
        message="Loading dashboard..." 
        style={styles.loadingContainer}
      />
    );
  }

  return (
    <BaseScreen safeArea={false}>
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
        
        <FeedbackSystem messages={messages} onDismiss={dismissFeedback} />
      </View>
    </BaseScreen>
  );
}
