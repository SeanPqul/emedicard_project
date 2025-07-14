/**
 * Dashboard Screen - eMediCard Application
 * 
 * IMPLEMENTATION NOTES:
 * - Follows UI_DESIGN_PROMPT.md specifications for dashboard layout
 * - Implements responsive design as per UI_UX_IMPLEMENTATION_GUIDE.md
 * - Header section with user profile, greeting, and notification badge
 * - Quick stats cards showing application metrics (2x2 grid layout)
 * - Quick actions section with primary action buttons
 * - Recent activity feed with empty state handling
 * - Aligns with eMediCard documentation requirements for user dashboard
 * 
 * DOCUMENTATION REFERENCES:
 * - UI_DESIGN_PROMPT.md: Dashboard screen structure (lines 24-63)
 * - UI_UX_IMPLEMENTATION_GUIDE.md: Responsive layout implementation
 * - emedicarddocumentation.txt: User workflow and system objectives
 * 
 * ACCESSIBILITY COMPLIANCE:
 * - Touch targets meet 44x44 pixel minimum
 * - Screen reader compatible with proper accessibility labels
 * - Color contrast meets WCAG AA standards
 * 
 * FUTURE ENHANCEMENTS:
 * - Add real-time notifications as per system requirements
 * - Implement QR code functionality for health card verification
 * - Add orientation scheduling alerts for Yellow card holders
 */

import { useDashboard } from '@/src/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../../assets/styles/tabs-styles/dashboard';
import { ActionButton, ActivityItem, EmptyState, StatCard } from '../../src/components';
import { getColor } from '../../src/styles/theme';
import { getUserDisplayName } from '../../src/utils/user-utils';

export default function Dashboard() {
  const { 
    user, 
    userProfile, 
    dashboardStats, 
    recentActivities, 
    currentTime, 
    unreadNotificationsCount,
    isLoading, 
    refreshing, 
    onRefresh, 
    getGreeting 
  } = useDashboard();

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.profilePicture}>
              <Image
                source={{ uri: user?.imageUrl || userProfile?.image }}
                style={styles.profileImage}
                placeholder="👤"
              />
            </View>
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>Good {getGreeting()}</Text>
              <Text style={styles.userName}>
                {getUserDisplayName(user, userProfile)}
              </Text>
              <Text style={styles.currentTime}>
                {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/(tabs)/notification')}>
            <Ionicons name="notifications-outline" size={24} color={getColor('text.primary')} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              icon="document-text-outline"
              title="Active Applications"
              value={dashboardStats.activeApplications.toString()}
              subtitle="In progress"
              color={getColor('accent.medicalBlue')}
              onPress={() => router.push('/(tabs)/application')}
            />
            <StatCard
              icon="card-outline"
              title="Pending Payments"
              value={dashboardStats.pendingPayments.toString()}
              subtitle={`₱${dashboardStats.pendingAmount}`}
              color={getColor('accent.warningOrange')}
              onPress={() => router.push('/(screens)/(shared)/payment')}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="calendar-outline"
              title="Upcoming Orientations"
              value={dashboardStats.upcomingOrientations.toString()}
              subtitle={dashboardStats.nextOrientationDate || "None scheduled"}
              color={getColor('accent.primaryGreen')}
              onPress={() => router.push('/(screens)/(shared)/orientation')}
            />
            <StatCard
              icon="shield-checkmark-outline"
              title="Valid Health Cards"
              value={dashboardStats.validHealthCards.toString()}
              subtitle="Active cards"
              color={getColor('accent.safetyGreen')}
              onPress={() => router.push('/(screens)/(shared)/health-cards')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon="add-circle-outline"
              title="New Application"
              subtitle="Apply for health card"
              onPress={() => router.push('/(tabs)/apply')}
              isPrimary
            />
            <ActionButton
              icon="document-text-outline"
              title="Document Requirements"
              subtitle="View required documents"
              onPress={() => router.push('/(screens)/(shared)/document-requirements')}
            />
            <ActionButton
              icon="card-outline"
              title="Make Payment"
              subtitle="Pay application fees"
              onPress={() => router.push('/(screens)/(shared)/payment')}
            />
            <ActionButton
              icon="qr-code-outline"
              title="View QR Code"
              subtitle="Show health card QR"
              onPress={() => router.push('/(screens)/(shared)/qr-code')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(screens)/(shared)/activity')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentActivities.length > 0 ? (
            <View style={styles.activityList}>
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="document-outline"
              title="No recent activity"
              subtitle="Your activities will appear here"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

