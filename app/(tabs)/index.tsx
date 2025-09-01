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

<<<<<<< HEAD
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
=======
        {/* Priority Actions Alert */}
        {(dashboardStats.pendingPayments > 0 || (currentApplication?.status === 'Under Review' && dashboardStats.upcomingOrientations > 0)) && (
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
                  Complete payment of ₱{dashboardStats.pendingAmount} to proceed with your application
                </Text>
                <Ionicons name="chevron-forward" size={16} color={getColor('semantic.error')} />
              </TouchableOpacity>
            )}
            {currentApplication?.status === 'Under Review' && dashboardStats.upcomingOrientations > 0 && (
              <TouchableOpacity 
                style={styles.priorityItem}
                onPress={() => router.push('/(screens)/(shared)/orientation')}
              >
                <Text style={styles.priorityText}>
                  Attend your scheduled food safety orientation
                </Text>
                <Ionicons name="chevron-forward" size={16} color={getColor('semantic.error')} />
              </TouchableOpacity>
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
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
              </Text>
            </View>
            
            {progress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
<<<<<<< HEAD
                  <Text style={styles.progressTitle}>Application Progress</Text>
                  <Text style={styles.progressStatus}>{progress.status}</Text>
=======
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
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
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

<<<<<<< HEAD
        {/* Quick Stats Cards */}
=======
        {/* Enhanced Overview Stats */}
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsRow}>
            <StatCard
              icon="document-text-outline"
<<<<<<< HEAD
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
=======
              title="Applications"
              value={dashboardStats.activeApplications.toString()}
              subtitle={dashboardStats.activeApplications > 0 ? "In progress" : "Ready to apply"}
              color={getColor('accent.medicalBlue')}
              onPress={() => router.push('/(tabs)/application')}
            />
            {/* Consolidated Payment Card */}
            <StatCard
              icon={dashboardStats.pendingPayments > 0 ? "alert-circle-outline" : "checkmark-circle-outline"}
              title={dashboardStats.pendingPayments > 0 ? "Payment Required" : "Payment Status"}
              value={dashboardStats.pendingPayments > 0 ? dashboardStats.pendingPayments.toString() : "Clear"}
              subtitle={dashboardStats.pendingPayments > 0 ? `₱${dashboardStats.pendingAmount} due` : "All payments up to date"}
              color={dashboardStats.pendingPayments > 0 ? getColor('semantic.error') : getColor('accent.safetyGreen')}
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
              onPress={() => router.push('/(screens)/(shared)/payment')}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="calendar-outline"
<<<<<<< HEAD
              title="Upcoming Orientations"
              value={dashboardStats.upcomingOrientations.toString()}
              subtitle={dashboardStats.nextOrientationDate || "None scheduled"}
=======
              title="Food Safety Orientation"
              value={dashboardStats.upcomingOrientations.toString()}
              subtitle={dashboardStats.upcomingOrientations > 0 ? "Scheduled" : "Not required"}
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
              color={getColor('accent.primaryGreen')}
              onPress={() => router.push('/(screens)/(shared)/orientation')}
            />
            <StatCard
              icon="shield-checkmark-outline"
<<<<<<< HEAD
              title="Valid Health Cards"
              value={dashboardStats.validHealthCards.toString()}
              subtitle="Active cards"
=======
              title="Health Cards"
              value={dashboardStats.validHealthCards.toString()}
              subtitle={dashboardStats.validHealthCards > 0 ? "Active" : "None issued"}
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
              color={getColor('accent.safetyGreen')}
              onPress={() => router.push('/(screens)/(shared)/health-cards')}
            />
          </View>
        </View>

<<<<<<< HEAD
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
=======
        {/* Contextual Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>What would you like to do?</Text>
          <View style={styles.actionsGrid}>
            {/* Primary Action - Context Aware */}
            {dashboardStats.activeApplications === 0 && dashboardStats.validHealthCards === 0 ? (
              <ActionButton
                icon="add-circle-outline"
                title="Apply for Health Card"
                subtitle="Start your first application"
                onPress={() => router.push('/(tabs)/apply')}
                isPrimary
              />
            ) : dashboardStats.pendingPayments > 0 ? (
              <ActionButton
                icon="card-outline"
                title="Complete Payment"
                subtitle={`₱${dashboardStats.pendingAmount} due`}
                onPress={() => router.push('/(screens)/(shared)/payment')}
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

            {/* Show Orientation for Food Handlers */}
            {currentApplication?.jobCategory?.name?.toLowerCase().includes('food') ? (
              <ActionButton
                icon="calendar-outline"
                title="Food Safety Orientation"
                subtitle="Schedule required seminar"
                onPress={() => router.push('/(screens)/(shared)/orientation')}
              />
            ) : (
              <ActionButton
                icon="help-circle-outline"
                title="Need Help?"
                subtitle="Contact support"
                onPress={() => router.push('/(tabs)/notification')}
              />
            )}
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
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

<<<<<<< HEAD
        {/* Health Card Status - Enhanced */}
        {dashboardStats.validHealthCards > 0 && (
          <View style={styles.healthCardStatusContainer}>
            <Text style={styles.sectionTitle}>Your Health Cards</Text>
            <View style={styles.healthCardPreview}>
=======
        {/* Health Card Status or Welcome Message */}
        {dashboardStats.validHealthCards > 0 ? (
          <View style={styles.healthCardStatusContainer}>
            <Text style={styles.sectionTitle}>Your Health Cards</Text>
            <TouchableOpacity 
              style={styles.healthCardPreview}
              onPress={() => router.push('/(screens)/(shared)/health-cards')}
              accessibilityLabel="View health cards"
            >
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
              <View style={styles.healthCardIcon}>
                <Ionicons name="shield-checkmark" size={32} color={getColor('accent.safetyGreen')} />
              </View>
              <View style={styles.healthCardInfo}>
                <Text style={styles.healthCardTitle}>
                  {dashboardStats.validHealthCards} Active Health Card{dashboardStats.validHealthCards > 1 ? 's' : ''}
                </Text>
                <Text style={styles.healthCardSubtitle}>
<<<<<<< HEAD
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
=======
                  Tap to view, download, or show QR code
                </Text>
              </View>
              <View style={styles.healthCardButton}>
                <Ionicons name="chevron-forward" size={20} color={getColor('text.secondary')} />
              </View>
            </TouchableOpacity>
          </View>
        ) : dashboardStats.activeApplications === 0 && (
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
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
          </View>
        )}
      </ScrollView>
    </View>
  );
}

