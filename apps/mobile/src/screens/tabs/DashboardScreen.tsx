// DashboardScreen - Page that uses DashboardWidget (FSD pattern)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BaseScreen } from '@/src/shared/components/core';
import { FeedbackSystem, useFeedback } from '@shared/components/feedback/feedback';
import { useNetwork } from '@shared/hooks/useNetwork';
import { useDashboardData } from '@features/dashboard/hooks';
import { DashboardWidgetEnhanced } from '@/src/widgets/dashboard/DashboardWidget.enhanced';
import { LoadingView } from '@shared/components';
import { getColor } from '@shared/styles/theme';

export function DashboardScreen() {
  const dashboardData = useDashboardData();
  const { messages, dismissFeedback } = useFeedback();
  const { isOnline } = useNetwork();

  if (dashboardData.isLoading) {
    return (
      <LoadingView 
        message="Loading dashboard..." 
        style={styles.loadingContainer}
      />
    );
  }

  return (
    <BaseScreen safeArea={false}>
      <DashboardWidgetEnhanced
        data={{
          user: dashboardData.user,
          userProfile: dashboardData.userProfile,
          userApplications: dashboardData.userApplications,
          dashboardStats: dashboardData.dashboardStats,
          recentActivities: dashboardData.recentActivities,
          currentTime: dashboardData.currentTime,
          unreadNotificationsCount: dashboardData.unreadNotificationsCount,
          isLoading: false,  // Already handled by loading check above
          refreshing: dashboardData.refreshing,
          currentApplication: dashboardData.currentApplication,
          isNewUser: dashboardData.isNewUser,
        }}
        handlers={{
          onRefresh: dashboardData.onRefresh,
          getGreeting: dashboardData.getGreeting
        }}
        isOnline={isOnline}
      />
      <FeedbackSystem messages={messages} onDismiss={dismissFeedback} />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: getColor('background.primary'),
  },
});
