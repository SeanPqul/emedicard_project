import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/styles/theme';
import { LoadingSpinner } from '@shared/components';
import { useRoleBasedNavigation } from '@features/navigation';
import { useRouter } from 'expo-router';
import { useUsers } from '@features/profile';
import { useInspectorDashboard } from '@features/inspector/hooks';
import { InspectorStats, CurrentSessionCard, SessionCard } from '@features/inspector/components';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { styles } from '@shared/styles/screens/inspector-dashboard';

export function InspectorDashboardScreen() {
  const { data: { currentUser: userProfile }, isLoading: userLoading } = useUsers();
  const { canAccessScreen } = useRoleBasedNavigation(userProfile?.role);
  const { data: dashboardData, isLoading: dashboardLoading } = useInspectorDashboard();
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
      <SafeAreaView style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedText}>Access Denied</Text>
          <Text style={styles.unauthorizedSubtext}>
            Inspector access required.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          <TouchableOpacity
            style={styles.scanHistoryButton}
            onPress={() => router.push('/(screens)/(inspector)/scan-history')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="document-text-outline"
              size={HEADER_CONSTANTS.ACTION_BUTTON_ICON_SIZE}
              color={HEADER_CONSTANTS.WHITE}
            />
          </TouchableOpacity>
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
    </SafeAreaView>
  );
}
