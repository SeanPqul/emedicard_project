// DashboardScreen - Page that uses DashboardWidget (FSD pattern)
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BaseScreen } from '@/src/shared/components/core';
import { FeedbackSystem, useFeedback } from '@shared/components/feedback/feedback';
import { useNetwork } from '@shared/hooks/useNetwork';
import { useDashboardData } from '@features/dashboard/hooks';
import { DashboardWidgetEnhanced } from '@/src/widgets/dashboard/DashboardWidget.enhanced';
import { LoadingView } from '@shared/components';
import { getColor, theme } from '@shared/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, verticalScale, scale } from '@shared/utils/responsive';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export function DashboardScreen() {
  const dashboardData = useDashboardData();
  const { messages, dismissFeedback } = useFeedback();
  const { isOnline } = useNetwork();
  const { signOut } = useAuth();
  const router = useRouter();

  if (dashboardData.isLoading) {
    return (
      <LoadingView 
        message="Loading dashboard..." 
        style={styles.loadingContainer}
      />
    );
  }

  // Block admin users from accessing mobile app
  if (dashboardData.userProfile?.role === 'admin') {
    const handleSignOut = async () => {
      try {
        await signOut();
        router.replace('/(auth)/sign-in');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };

    return (
      <BaseScreen safeArea={true}>
        <View style={styles.adminBlockContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={moderateScale(80)} color={theme.colors.orange[500]} />
          </View>

          <Text style={styles.title}>Access Restricted</Text>

          <Text style={styles.message}>
            This mobile application is only available for <Text style={styles.bold}>applicants</Text> and <Text style={styles.bold}>inspectors</Text>.
          </Text>

          <View style={styles.infoBox}>
            <Ionicons name="desktop-outline" size={moderateScale(24)} color={theme.colors.primary[600]} />
            <Text style={styles.infoText}>
              As an <Text style={styles.bold}>administrator</Text>, please use the web admin dashboard to manage the system.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={moderateScale(20)} color="#FFFFFF" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            If you believe this is an error, please contact your system administrator.
          </Text>
        </View>
      </BaseScreen>
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
          healthCard: dashboardData.healthCard,
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
  adminBlockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    backgroundColor: theme.colors.background.secondary,
  },
  iconContainer: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: theme.colors.orange[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  message: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(24),
  },
  bold: {
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    padding: scale(16),
    borderRadius: moderateScale(12),
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[600],
    marginBottom: verticalScale(32),
    gap: scale(12),
  },
  infoText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(20),
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[600],
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(32),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(16),
    gap: scale(8),
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  helpText: {
    fontSize: moderateScale(12),
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
