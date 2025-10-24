import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/styles/theme';
import { LoadingSpinner, ErrorState } from '@shared/components';
import { useRoleBasedNavigation } from '@features/navigation';
import { useRouter } from 'expo-router';
import { useUsers } from '@features/profile';
import { useInspectorDashboard } from '@features/inspector/hooks';
import { InspectorStats, CurrentSessionCard, SessionCard } from '@features/inspector/components';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';

export function InspectorDashboardScreen() {
  const { data: { currentUser: userProfile }, isLoading: userLoading } = useUsers();
  const { canAccessScreen } = useRoleBasedNavigation(userProfile?.role);
  const { data: dashboardData, isLoading: dashboardLoading, error } = useInspectorDashboard();
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
            onRetry={() => router.replace('/(screens)/(inspector)/dashboard')}
            variant="card"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Green Header */}
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
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => router.push('/(screens)/(inspector)/scan-history')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="document-text-outline"
                size={HEADER_CONSTANTS.ACTION_BUTTON_ICON_SIZE}
                color={HEADER_CONSTANTS.WHITE}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => router.push('/(screens)/(inspector)/settings')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="settings-outline"
                size={HEADER_CONSTANTS.ACTION_BUTTON_ICON_SIZE}
                color={HEADER_CONSTANTS.WHITE}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Stats */}
        {dashboardData && <InspectorStats stats={dashboardData.stats} />}

        {/* Current Session */}
        {dashboardData && (
          <CurrentSessionCard session={dashboardData.currentSession} />
        )}

        {/* Upcoming Sessions */}
        {dashboardData && dashboardData.upcomingSessions.length > 0 && (
          <View style={styles.upcomingSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>UPCOMING SESSIONS TODAY</Text>
              <TouchableOpacity
                onPress={() => router.push('/(screens)/(inspector)/sessions')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {dashboardData.upcomingSessions.slice(0, 3).map((session) => (
              <SessionCard key={session._id} session={session} />
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(screens)/(inspector)/sessions')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={moderateScale(20)}
              color={theme.colors.primary[500]}
            />
            <Text style={styles.actionButtonText}>View All Sessions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(screens)/(inspector)/orientation-attendance')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="qr-code-outline"
              size={moderateScale(20)}
              color={theme.colors.primary[500]}
            />
            <Text style={styles.actionButtonText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(24),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: HEADER_CONSTANTS.ICON_TEXT_GAP,
    flex: 1,
  },
  title: {
    fontSize: HEADER_CONSTANTS.TITLE_FONT_SIZE,
    fontWeight: '600',
    color: HEADER_CONSTANTS.WHITE,
    lineHeight: HEADER_CONSTANTS.TITLE_LINE_HEIGHT,
  },
  subtitle: {
    fontSize: HEADER_CONSTANTS.SUBTITLE_FONT_SIZE,
    color: HEADER_CONSTANTS.WHITE_TRANSPARENT,
    marginTop: verticalScale(2),
  },
  headerActions: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },
  headerActionButton: {
    width: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
    height: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
    borderRadius: HEADER_CONSTANTS.ACTION_BUTTON_RADIUS,
    backgroundColor: HEADER_CONSTANTS.WHITE_OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: scale(16),
    marginTop: verticalScale(24),
    gap: scale(12),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.primary,
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    gap: scale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
  bottomSpacer: {
    height: verticalScale(24),
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
