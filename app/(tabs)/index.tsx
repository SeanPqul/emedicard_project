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
    userApplications,
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

  // Get current job category from user applications
  const currentApplication = userApplications?.find((app: any) => 
    app.status === 'Submitted' || app.status === 'Under Review' || app.status === 'Approved'
  );
  
  const getJobCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'food handler':
      case 'food':
        return getColor('jobCategories.foodHandler');
      case 'security guard':
      case 'security':
        return getColor('jobCategories.securityGuard');
      case 'pink':
      case 'skin contact':
        return getColor('jobCategories.pink');
      default:
        return getColor('jobCategories.others');
    }
  };

  const getJobCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'food handler':
      case 'food':
        return 'restaurant-outline';
      case 'security guard':
      case 'security':
        return 'shield-outline';
      case 'pink':
      case 'skin contact':
        return 'hand-left-outline';
      default:
        return 'briefcase-outline';
    }
  };

  const getApplicationProgress = () => {
    if (!currentApplication) return null;
    
    const steps = ['Submitted', 'Under Review', 'Approved'];
    const currentStep = steps.indexOf(currentApplication.status);
    
    return {
      currentStep: currentStep + 1,
      totalSteps: steps.length,
      status: currentApplication.status,
      nextStep: currentStep < steps.length - 1 ? steps[currentStep + 1] : null
    };
  };

  const progress = getApplicationProgress();

  return (
    <View style={styles.container}>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: 50, // Space for tab bar + extra padding
          flexGrow: 1
        }}
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
          
          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={() => router.push('/(tabs)/notification')}
            accessibilityLabel="Notifications"
            accessibilityHint="View your notifications"
          >
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

        {/* Current Application Status - Enhanced */}
        {currentApplication && (
          <View style={styles.currentApplicationContainer}>
            <View style={styles.currentApplicationHeader}>
              <View style={styles.categoryBadge}>
                                 <Ionicons 
                   name={getJobCategoryIcon(currentApplication.jobCategory?.name || '') as any} 
                   size={16} 
                   color={getColor('text.inverse')} 
                 />
                 <Text style={styles.categoryText}>
                   {currentApplication.jobCategory?.name || 'Unknown Category'}
                 </Text>
              </View>
              <Text style={styles.applicationId}>
                ID: {currentApplication._id.slice(-8)}
              </Text>
            </View>
            
            {progress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Application Progress</Text>
                  <Text style={styles.progressStatus}>{progress.status}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${(progress.currentStep / progress.totalSteps) * 100}%`,
                        backgroundColor: getJobCategoryColor(currentApplication.jobCategory?.name || '')
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  Step {progress.currentStep} of {progress.totalSteps}
                  {progress.nextStep && ` • Next: ${progress.nextStep}`}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
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
            <TouchableOpacity 
              onPress={() => router.push('/(screens)/(shared)/activity')}
              accessibilityLabel="View all activities"
            >
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

        {/* Health Card Status - Enhanced */}
        {dashboardStats.validHealthCards > 0 && (
          <View style={styles.healthCardStatusContainer}>
            <Text style={styles.sectionTitle}>Your Health Cards</Text>
            <View style={styles.healthCardPreview}>
              <View style={styles.healthCardIcon}>
                <Ionicons name="shield-checkmark" size={32} color={getColor('accent.safetyGreen')} />
              </View>
              <View style={styles.healthCardInfo}>
                <Text style={styles.healthCardTitle}>
                  {dashboardStats.validHealthCards} Active Health Card{dashboardStats.validHealthCards > 1 ? 's' : ''}
                </Text>
                <Text style={styles.healthCardSubtitle}>
                  Tap to view and manage your health cards
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.healthCardButton}
                onPress={() => router.push('/(screens)/(shared)/health-cards')}
                accessibilityLabel="View health cards"
              >
                <Ionicons name="chevron-forward" size={20} color={getColor('text.secondary')} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

