import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatInTimeZone } from 'date-fns-tz';
import { theme } from '@shared/styles/theme';
import { LoadingSpinner, ErrorState } from '@shared/components';
import { useRoleBasedNavigation } from '@features/navigation';
import { useRouter } from 'expo-router';
import { useUsers } from '@features/profile';
import { useInspectorDashboard } from '@features/inspector/hooks';
import { DailyGreeting, CurrentSessionCard, SessionCard, RecentActivity } from '@features/inspector/components';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

const PHT_TZ = 'Asia/Manila';

export function InspectorDashboardScreen() {
  const { data: { currentUser: userProfile }, isLoading: userLoading } = useUsers();
  const { canAccessScreen } = useRoleBasedNavigation(userProfile?.role);
  const { data: dashboardData, serverTime, isLoading: dashboardLoading, error } = useInspectorDashboard();
  const router = useRouter();

  React.useEffect(() => {
    if (userProfile && !canAccessScreen('inspector-dashboard')) {
      router.replace('/(tabs)');
    }
  }, [userProfile, canAccessScreen, router]);

  if (userLoading || dashboardLoading) {
    return (
      <LoadingSpinner 
        visible={true} 
        message="Loading inspector dashboard..." 
        fullScreen 
        type="pulse" 
        icon="clipboard" 
      />
    );
  }

  if (!userProfile || userProfile.role !== 'inspector') {
    return (
      <View style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedText}>Access Denied</Text>
          <Text style={styles.unauthorizedSubtext}>
            Inspector access required.
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <ErrorState
            type="network"
            title="Failed to Load Dashboard"
            message="Unable to fetch dashboard data. Please check your connection and try again."
            onRetry={() => router.replace('/(inspector-tabs)/dashboard')}
            variant="card"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Inline Title & Greeting */}
        {userProfile && serverTime && dashboardData && (
          <View style={styles.headerSection}>
            <View style={styles.titleRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.pageTitle}>Overview</Text>
                <View style={styles.sessionBadge}>
                  <Text style={styles.sessionBadgeText}>
                    {dashboardData.allSessions.length} {dashboardData.allSessions.length === 1 ? 'session' : 'sessions'}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.greeting}>
              {getGreeting(serverTime)}, {userProfile.fullname?.split(' ')[0] || 'Inspector'} 👋
            </Text>
          </View>
        )}

        {/* Current Session - Most Important */}
        {dashboardData && (
          <CurrentSessionCard 
            session={dashboardData.currentSession} 
            serverTime={serverTime}
          />
        )}

        {/* Upcoming Sessions Preview */}
        {dashboardData && dashboardData.upcomingSessions.length > 0 && (
          <View style={styles.upcomingSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>UPCOMING TODAY</Text>
              <TouchableOpacity
                onPress={() => router.push('/(inspector-tabs)/sessions')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {dashboardData.upcomingSessions.slice(0, 2).map((session) => (
              <SessionCard key={session._id} session={session} />
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

function getGreeting(serverTime: number): string {
  // Get the hour in PHT timezone
  const hour = parseInt(formatInTimeZone(serverTime, PHT_TZ, 'H'), 10);
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollViewContent: {
    paddingBottom: verticalScale(100),
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  headerSection: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(16),
    backgroundColor: theme.colors.background.primary,
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
  },
  titleRow: {
    marginBottom: verticalScale(12),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  pageTitle: {
    fontSize: moderateScale(32),
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  sessionBadge: {
    backgroundColor: `${theme.colors.primary[500]}12`,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  sessionBadgeText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
  greeting: {
    fontSize: moderateScale(18),
    fontWeight: '500',
    color: theme.colors.text.secondary,
    letterSpacing: -0.2,
  },
  upcomingSection: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(24),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    letterSpacing: 1,
  },
  viewAllText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    backgroundColor: theme.colors.background.secondary,
  },
  unauthorizedText: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: theme.colors.semantic.error,
    marginBottom: verticalScale(8),
  },
  unauthorizedSubtext: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(16),
  },
});
