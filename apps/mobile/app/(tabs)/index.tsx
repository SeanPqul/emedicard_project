import { useDashboard } from '@/src/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ActionButton, EmptyState } from '../../src/shared/ui';
import { ActivityItem, StatCard } from '../../src/features/dashboard/ui';
import { DashboardHeader } from '../../src/shared/ui';
import { FeedbackSystem, useFeedback } from '../../src/shared/ui/FeedbackSystem';
import { useNetwork } from '../../src/hooks/useNetwork';
import { styles } from '../../src/styles/screens/tabs-dashboard';
import { getColor, getSpacing, layoutPatterns } from '../../src/styles/theme';
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
    getGreeting,
    getJobCategoryById 
  } = useDashboard();

  const { messages, showSuccess, showError, dismissFeedback } = useFeedback();
  const { isOnline } = useNetwork();


  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  // Get current job category from user applications
  const currentApplication = userApplications?.find((app: any) => 
    app.status === 'Submitted' || app.status === 'Under Review' || app.status === 'Approved'
  );
  
  
  // Get job category details - the backend already provides the jobCategory object
  const currentJobCategory = currentApplication?.jobCategory || null;
  
  const getJobCategoryColor = (category: string) => {
    const normalizedCategory = category?.toLowerCase().trim();
    switch (normalizedCategory) {
      case 'food handler':
      case 'food':
      case 'food service':
      case 'food safety':
        return getColor('jobCategories.foodHandler');
      case 'security guard':
      case 'security':
      case 'security officer':
        return getColor('jobCategories.securityGuard');
      case 'pink':
      case 'skin contact':
      case 'pink collar':
      case 'skin-to-skin contact':
        return getColor('jobCategories.pink');
      case 'unknown category':
      case '':
      case undefined:
      case null:
        return getColor('border.medium'); // Neutral color for unknown
      default:
        return getColor('jobCategories.others');
    }
  };

  const getJobCategoryIcon = (category: string) => {
    const normalizedCategory = category?.toLowerCase().trim();
    switch (normalizedCategory) {
      case 'food handler':
      case 'food':
      case 'food service':
      case 'food safety':
        return 'restaurant-outline';
      case 'security guard':
      case 'security':
      case 'security officer':
        return 'shield-outline';
      case 'pink':
      case 'skin contact':
      case 'pink collar':
      case 'skin-to-skin contact':
        return 'hand-left-outline';
      case 'unknown category':
      case '':
      case undefined:
      case null:
        return 'help-circle-outline';
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
      
      {/* Simple Offline Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="wifi-off" size={16} color={getColor('ui.white')} />
          <Text style={styles.offlineText}>You&apos;re offline</Text>
        </View>
      )}

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
        testID="dashboard-scroll-view"
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

        {/* Welcome Message for New Users - Moved to Top */}
        {(!userApplications || userApplications.length === 0) && dashboardStats.validHealthCards === 0 && (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="medical-outline" size={48} color={getColor('accent.medicalBlue')} />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to eMediCard</Text>
            <Text style={styles.welcomeSubtitle}>
              Get your Davao City health card digitally. No more long queues - apply, track, and manage everything from your phone.
            </Text>
            <TouchableOpacity 
              style={styles.welcomeButton}
              onPress={() => router.push('/(tabs)/apply')}
            >
              <Text style={styles.welcomeButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={16} color={getColor('text.inverse')} />
            </TouchableOpacity>
          </View>
        )}

        {/* Priority Actions Alert */}
        {(dashboardStats.pendingPayments > 0 || 
          (currentApplication?.jobCategory?.name?.toLowerCase().includes('food') && 
           (dashboardStats.upcomingOrientations > 0 || (!currentApplication?.orientationCompleted && !dashboardStats.upcomingOrientations)))) && (
          <View style={styles.priorityAlertContainer}>
            <View style={styles.priorityHeader}>
              <Ionicons name="alert-circle" size={20} color={getColor('semantic.error')} />
              <Text style={styles.priorityTitle}>Action Required</Text>
            </View>
            {dashboardStats.pendingPayments > 0 && (
              <TouchableOpacity 
                style={styles.priorityItem}
                onPress={() => router.push('/(screens)/(shared)/payment')}
              >
                <Text style={styles.priorityText}>
                  Pay ₱{dashboardStats.pendingAmount} to proceed with your application
                </Text>
                <Ionicons name="chevron-forward" size={16} color={getColor('semantic.error')} />
              </TouchableOpacity>
            )}
            {/* Food Safety Orientation - for food handlers only */}
            {currentApplication?.jobCategory?.name?.toLowerCase().includes('food') && (
              (dashboardStats.upcomingOrientations > 0 || (!currentApplication?.orientationCompleted && !dashboardStats.upcomingOrientations)) && (
                <TouchableOpacity 
                  style={styles.priorityItem}
                  onPress={() => router.push('/(screens)/(shared)/orientation')}
                >
                  <Text style={styles.priorityText}>
                    {dashboardStats.upcomingOrientations > 0 
                      ? "Attend your scheduled food safety orientation"
                      : "Schedule your required food safety orientation"
                    }
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={getColor('semantic.error')} />
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* Enhanced Application Status */}
        {currentApplication && (
          <View style={styles.currentApplicationContainer}>
            <View style={styles.currentApplicationHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: getJobCategoryColor(currentApplication.jobCategory?.name || '') }]}>
                <Ionicons 
                  name={getJobCategoryIcon(currentApplication.jobCategory?.name || '') as any} 
                  size={16} 
                  color={getColor('text.inverse')} 
                />
                <Text style={styles.categoryText}>
                  {currentApplication.jobCategory?.name === 'Food Handler' ? 'Yellow Card' : 
                   currentApplication.jobCategory?.name === 'Non-Food Worker' ? 'Green Card' :
                   currentApplication.jobCategory?.name === 'Skin-to-Skin Contact' ? 'Pink Card' :
                   currentApplication.jobCategory?.name || 'Health Card'}
                </Text>
              </View>
              <Text style={styles.applicationId}>
                #{currentApplication._id.slice(-6).toUpperCase()}
              </Text>
            </View>
            
            {progress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Application Status</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: progress.status === 'Approved' ? getColor('accent.safetyGreen') + '20' :
                                   progress.status === 'Under Review' ? getColor('accent.warningOrange') + '20' :
                                   getColor('accent.medicalBlue') + '20'
                  }]}>
                    <Text style={[styles.progressStatus, {
                      color: progress.status === 'Approved' ? getColor('accent.safetyGreen') :
                             progress.status === 'Under Review' ? getColor('accent.warningOrange') :
                             getColor('accent.medicalBlue')
                    }]}>{progress.status}</Text>
                  </View>
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

        {/* Enhanced Overview Stats - Hidden for New Users */}
        {!(!userApplications || userApplications.length === 0) && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsRow}>
            <StatCard
              icon="document-text-outline"
              title="Applications"
              value={dashboardStats.activeApplications.toString()}
              subtitle={dashboardStats.activeApplications > 0 ? "In progress" : "Ready to apply"}
              color={getColor('accent.medicalBlue')}
              onPress={() => router.push('/(tabs)/application')}
            />
            {/* Consolidated Payment Card */}
            <StatCard
              icon={dashboardStats.pendingPayments > 0 ? "alert-circle-outline" : "checkmark-circle-outline"}
              title="Payments"
              value={dashboardStats.pendingPayments > 0 ? `${dashboardStats.pendingPayments} Due` : "Clear"}
              subtitle={dashboardStats.pendingPayments > 0 ? `₱${dashboardStats.pendingAmount} due` : "All payments up to date"}
              color={dashboardStats.pendingPayments > 0 ? getColor('semantic.error') : getColor('accent.safetyGreen')}
              onPress={() => router.push('/(screens)/(shared)/payment')}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon={
                currentApplication?.jobCategory?.name?.toLowerCase().includes('food') 
                  ? (dashboardStats.upcomingOrientations > 0 ? "calendar" : "calendar-outline")
                  : "checkmark-circle-outline"
              }
              title="Food Safety"
              value={
                !currentApplication?.jobCategory?.name?.toLowerCase().includes('food') 
                  ? "Not Required"
                  : dashboardStats.upcomingOrientations > 0 
                    ? "Scheduled"
                    : currentApplication?.orientationCompleted 
                      ? "Completed"
                      : "Required"
              }
              subtitle={
                !currentApplication?.jobCategory?.name?.toLowerCase().includes('food') 
                  ? "Non-food worker"
                  : dashboardStats.upcomingOrientations > 0 
                    ? "Attend scheduled session"
                    : currentApplication?.orientationCompleted 
                      ? "Requirements met"
                      : "Schedule required"
              }
              color={
                !currentApplication?.jobCategory?.name?.toLowerCase().includes('food') 
                  ? getColor('text.secondary')
                  : dashboardStats.upcomingOrientations > 0 
                    ? getColor('accent.warningOrange')
                    : currentApplication?.orientationCompleted 
                      ? getColor('accent.safetyGreen')
                      : getColor('semantic.error')
              }
              onPress={() => router.push('/(screens)/(shared)/orientation')}
            />
            <StatCard
              icon="shield-checkmark-outline"
              title="Health Cards"
              value={dashboardStats.validHealthCards.toString()}
              subtitle={dashboardStats.validHealthCards > 0 ? "Active" : "None issued"}
              color={getColor('accent.safetyGreen')}
              onPress={() => router.push('/(screens)/(shared)/health-cards')}
            />
          </View>
        </View>
        )}

        {/* Contextual Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>What would you like to do?</Text>
          <View style={styles.actionsGrid}>
            {/* Primary Action - Context Aware */}
            {(!userApplications || userApplications.length === 0) && dashboardStats.validHealthCards === 0 ? (
              <ActionButton
                icon="add-circle-outline"
                title="Apply for Health Card"
                subtitle="Start your first application"
                onPress={() => router.push('/(tabs)/apply')}
                isPrimary
              />
            ) : dashboardStats.pendingPayments > 0 ? (
              <ActionButton
                icon="information-circle-outline"
                title="Application Status"
                subtitle="Track your progress"
                onPress={() => router.push('/(tabs)/application')}
                isPrimary
              />
            ) : dashboardStats.validHealthCards > 0 ? (
              <ActionButton
                icon="qr-code-outline"
                title="Show Health Card"
                subtitle="Display your QR code"
                onPress={() => router.push('/(screens)/(shared)/qr-code')}
                isPrimary
              />
            ) : (
              <ActionButton
                icon="refresh-outline"
                title="Renew Health Card"
                subtitle="Start renewal process"
                onPress={() => router.push('/(tabs)/apply')}
                isPrimary
              />
            )}

            {/* Secondary Actions */}
            <ActionButton
              icon="document-text-outline"
              title="Requirements Guide"
              subtitle="What documents you need"
              onPress={() => router.push('/(screens)/(shared)/document-requirements')}
            />
            
            {/* Show Upload Documents if has active application */}
            {dashboardStats.activeApplications > 0 ? (
              <ActionButton
                icon="cloud-upload-outline"
                title="Upload Documents"
                subtitle="Submit missing documents"
                onPress={() => router.push('/(screens)/(shared)/upload-documents')}
              />
            ) : (
              <ActionButton
                icon="information-circle-outline"
                title="Application Status"
                subtitle="Track your progress"
                onPress={() => router.push('/(tabs)/application')}
              />
            )}

            {/* Show Orientation for Food Handlers - only if not urgent */}
            {currentApplication?.jobCategory?.name?.toLowerCase().includes('food') && 
             !(dashboardStats.upcomingOrientations > 0 || (!currentApplication?.orientationCompleted && !dashboardStats.upcomingOrientations)) ? (
              <ActionButton
                icon="calendar-outline"
                title="Food Safety Orientation"
                subtitle="View requirements & schedule"
                onPress={() => router.push('/(screens)/(shared)/orientation')}
              />
            ) : !currentApplication?.jobCategory?.name?.toLowerCase().includes('food') ? (
              <ActionButton
                icon="help-circle-outline"
                title="Need Help?"
                subtitle="Contact support"
                onPress={() => router.push('/(tabs)/notification')}
              />
            ) : (
              <ActionButton
                icon="help-circle-outline"
                title="Need Help?"
                subtitle="Contact support"
                onPress={() => router.push('/(tabs)/notification')}
              />
            )}
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

        {/* Health Card Status for Existing Users */}
        {dashboardStats.validHealthCards > 0 && (
          <View style={styles.healthCardStatusContainer}>
            <Text style={styles.sectionTitle}>Your Health Cards</Text>
            <TouchableOpacity 
              style={styles.healthCardPreview}
              onPress={() => router.push('/(screens)/(shared)/health-cards')}
              accessibilityLabel="View health cards"
            >
              <View style={styles.healthCardIcon}>
                <Ionicons name="shield-checkmark" size={32} color={getColor('accent.safetyGreen')} />
              </View>
              <View style={styles.healthCardInfo}>
                <Text style={styles.healthCardTitle}>
                  {dashboardStats.validHealthCards} Active Health Card{dashboardStats.validHealthCards > 1 ? 's' : ''}
                </Text>
                <Text style={styles.healthCardSubtitle}>
                  Tap to view, download, or show QR code
                </Text>
              </View>
              <View style={styles.healthCardButton}>
                <Ionicons name="chevron-forward" size={20} color={getColor('text.secondary')} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <FeedbackSystem messages={messages} onDismiss={dismissFeedback} />
    </View>
  );
}
