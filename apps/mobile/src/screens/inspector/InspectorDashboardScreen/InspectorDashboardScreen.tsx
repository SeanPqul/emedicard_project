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
  const [currentTime, setCurrentTime] = useState('');

  // Update current time display every second
  useEffect(() => {
    let offset = 0;
    if (serverTime) {
      offset = serverTime - Date.now();
    }

    const updateTime = () => {
      const currentServerTime = Date.now() + offset;
      setCurrentTime(formatInTimeZone(currentServerTime, PHT_TZ, 'h:mm:ss a'));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [serverTime]);

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
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleContainer}>
              <Ionicons
                name="clipboard"
                size={HEADER_CONSTANTS.ICON_SIZE}
                color={HEADER_CONSTANTS.WHITE}
              />
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>Inspector Dashboard</Text>
                <Text style={styles.subtitle}>Food Safety Orientation Tracker</Text>
              </View>
            </View>
          </View>
        </View>
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
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <View style={styles.iconBadge}>
              <Ionicons
                name="clipboard"
                size={moderateScale(20)}
                color={HEADER_CONSTANTS.WHITE}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Dashboard</Text>
              <Text style={styles.subtitle}>Orientation Tracker</Text>
            </View>
          </View>
          {/* Server Time Display */}
          <View style={styles.timeIndicator}>
            <Ionicons name="time" size={moderateScale(14)} color={HEADER_CONSTANTS.WHITE} />
            <Text style={styles.timeText}>{currentTime}</Text>
            <Text style={styles.timezoneLabel}>PHT</Text>
          </View>
        </View>
      </View>

      {/* Simple Greeting */}
      {dashboardData && userProfile && (
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            {getGreeting()}, {userProfile.fullname?.split(' ')[0] || 'Inspector'} 👋
          </Text>
          <View style={styles.sessionBadge}>
            <Ionicons name="calendar-outline" size={moderateScale(14)} color={theme.colors.primary[500]} />
            <Text style={styles.sessionCount}>
              {dashboardData.allSessions.length} {dashboardData.allSessions.length === 1 ? 'session' : 'sessions'} today
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
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
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollViewContent: {
    paddingBottom: verticalScale(100), // Extra space for tab bar on all devices
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: HEADER_CONSTANTS.WHITE_OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: scale(12),
    flex: 1,
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: HEADER_CONSTANTS.WHITE,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: moderateScale(12),
    color: HEADER_CONSTANTS.WHITE_TRANSPARENT,
    marginTop: verticalScale(2),
    fontWeight: '500',
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEADER_CONSTANTS.WHITE_OVERLAY,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
    gap: scale(4),
  },
  timeText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: HEADER_CONSTANTS.WHITE,
    letterSpacing: 0.5,
  },
  timezoneLabel: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: HEADER_CONSTANTS.WHITE_TRANSPARENT,
    letterSpacing: 0.5,
    marginLeft: scale(2),
  },
  greetingContainer: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(16),
    backgroundColor: theme.colors.background.primary,
  },
  greeting: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(8),
    letterSpacing: -0.3,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    alignSelf: 'flex-start',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    backgroundColor: `${theme.colors.primary[500]}10`,
    borderRadius: moderateScale(20),
  },
  sessionCount: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
  scrollView: {
    flex: 1,
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
