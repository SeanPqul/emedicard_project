// DashboardScreen - Page that uses DashboardWidget (FSD pattern)
import React from 'react';
import { View } from 'react-native';
import { BaseScreen } from '@/src/shared/components/core';
import { FeedbackSystem, useFeedback } from '@shared/components/feedback/feedback';
import { useNetwork } from '@shared/hooks/useNetwork';
import { useDashboardData } from '@features/dashboard/hooks';
import { DashboardWidget } from '@/src/widgets/dashboard';
import { LoadingView } from '@shared/components';
import { styles } from './DashboardScreen.styles';

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
      <View style={styles.container}>
        <DashboardWidget
          data={dashboardData}
          handlers={{
            onRefresh: dashboardData.onRefresh,
            getGreeting: dashboardData.getGreeting
          }}
          isOnline={isOnline}
        />
        <FeedbackSystem messages={messages} onDismiss={dismissFeedback} />
      </View>
    </BaseScreen>
  );
}