import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StatCard, ActionButton, ActivityItem, EmptyState } from '../../src/components';
import { styles } from '../../assets/styles/tabs-styles/dashboard';
import { useDashboard } from '@/src/hooks';
import { getUserDisplayName } from '../../src/utils/user-utils';
import { getColor } from '../../src/styles/theme';

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
              onPress={() => router.push('/screens/shared/payment')}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="calendar-outline"
              title="Upcoming Orientations"
              value={dashboardStats.upcomingOrientations.toString()}
              subtitle={dashboardStats.nextOrientationDate || "None scheduled"}
              color={getColor('accent.primaryGreen')}
              onPress={() => router.push('/screens/shared/orientation')}
            />
            <StatCard
              icon="shield-checkmark-outline"
              title="Valid Health Cards"
              value={dashboardStats.validHealthCards.toString()}
              subtitle="Active cards"
              color={getColor('accent.safetyGreen')}
              onPress={() => router.push('/screens/shared/health-cards')}
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
              onPress={() => router.push('/screens/shared/document-requirements')}
            />
            <ActionButton
              icon="card-outline"
              title="Make Payment"
              subtitle="Pay application fees"
              onPress={() => router.push('/screens/shared/payment')}
            />
            <ActionButton
              icon="qr-code-outline"
              title="View QR Code"
              subtitle="Show health card QR"
              onPress={() => router.push('/screens/shared/qr-code')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/screens/shared/activity')}>
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

