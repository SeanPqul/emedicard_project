import { useDashboard } from '@/src/hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { FeedbackSystem, useFeedback } from '../../src/components/feedback/FeedbackSystem';
import { styles } from '../../assets/styles/tabs-styles/dashboard';
import { ActivityItem, CTAButton, EmptyState, StatCard } from '../../src/components';
import { DashboardHeader } from '../../src/components/ui/DashboardHeader';
import { getColor, getSpacing } from '../../src/styles/theme';
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

  const { messages, showSuccess, showError, dismissFeedback } = useFeedback();

  // Animation state for collapsible activity panel
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useState(new Animated.Value(0))[0];
  const animatedOpacity = useState(new Animated.Value(1))[0];
  const animatedRotation = useState(new Animated.Value(0))[0];
  
  // Calculate heights based on activity items (approximately 80px per item)
  // Shows 2 items when collapsed, all items when expanded
  const itemHeight = 80;
  const emptyStateHeight = 150; // Height for empty state
  const hasActivities = recentActivities.length > 0;
  const collapsedHeight = hasActivities ? Math.min(recentActivities.length, 2) * itemHeight : emptyStateHeight;
  const expandedHeight = hasActivities ? recentActivities.length * itemHeight : emptyStateHeight;
  
  useEffect(() => {
    // Animate height and rotation together
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: expanded ? expandedHeight : collapsedHeight,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedRotation, {
        toValue: expanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [expanded, expandedHeight, collapsedHeight]);
  
  // Initialize height to collapsed state
  useEffect(() => {
    animatedHeight.setValue(collapsedHeight);
  }, [collapsedHeight]);
  
  const rotateAnimation = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

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
          flexGrow: 1
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        testID="dashboard-scroll-view"
      >
        {/* Header Section - Extracted to reusable component */}
        {/* Features: profile display, greeting, notifications, quick actions menu */}
        <DashboardHeader
          greeting={`Good ${getGreeting()}`}
          userName={getUserDisplayName(user, userProfile)}
          userImage={user?.imageUrl || userProfile?.image}
          currentTime={currentTime}
          unreadNotificationsCount={unreadNotificationsCount}
        />

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

        {/* My Health Card - Unified Interactive Section */}
        {/* REFACTORED: Combined overview stats into single "My Health Card" section */}
        {/* Each card now serves as both display and navigation element */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>My Health Card</Text>
          <View style={styles.statsRow}>
            <StatCard
              icon="document-text-outline"
              title="Applications"
              value={dashboardStats.activeApplications.toString()}
              subtitle={dashboardStats.activeApplications > 0 ? "Active" : "No active applications"}
              color={getColor('accent.medicalBlue')}
              onPress={() => router.push('/(tabs)/application')}
            />
            <StatCard
              icon="card-outline"
              title="Payments"
              value={dashboardStats.pendingPayments > 0 ? dashboardStats.pendingPayments.toString() : "0"}
              subtitle={dashboardStats.pendingPayments > 0 ? `₱${dashboardStats.pendingAmount} pending` : "Make payment"}
              color={getColor('accent.warningOrange')}
              onPress={() => router.push('/(screens)/(shared)/payment')}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="calendar-outline"
              title="Orientation"
              value={dashboardStats.upcomingOrientations > 0 ? dashboardStats.nextOrientationDate?.split(' ')[0] || "Scheduled" : "None"}
              subtitle={dashboardStats.upcomingOrientations > 0 ? "Next schedule" : "No orientation scheduled"}
              color={getColor('accent.primaryGreen')}
              onPress={() => router.push('/(screens)/(shared)/orientation')}
            />
            <StatCard
              icon="qr-code-outline"
              title="Digital Health Card"
              value={dashboardStats.validHealthCards > 0 ? "Active" : "Inactive"}
              subtitle={dashboardStats.validHealthCards > 0 ? "Tap to view QR" : "No active card"}
              color={getColor('accent.safetyGreen')}
              onPress={() => router.push('/(screens)/(shared)/qr-code')}
            />
          </View>
        </View>

        {/* Primary Actions Row - Prominent CTA Buttons */}
        {/* REFACTORED: Replaced grid of ActionButtons with vertical stack of CTAButtons */}
        {/* Enhanced touch targets (64px height) and clearer visual hierarchy */}
        <View style={styles.primaryActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.primaryActionsRow}>
            <CTAButton
              title="Apply for Health Card"
              subtitle="Start new application"
              icon="add-circle-outline"
              variant="primary"
              onPress={() => router.push('/(tabs)/apply')}
              accessibilityLabel="Apply for Health Card"
              accessibilityHint="Start a new health card application"
            />
            <View style={{ height: getSpacing('md') }} />
            <CTAButton
              title="Renew Health Card"
              subtitle="Renew existing card"
              icon="refresh-outline"
              variant="secondary"
              size="medium"
              onPress={() => router.push('/(tabs)/application')}
              accessibilityLabel="Renew Health Card"
              accessibilityHint="Renew your existing health card"
            />
            <View style={{ height: getSpacing('md') }} />
            <CTAButton
              title="View Digital Card"
              subtitle="Show QR code"
              icon="qr-code-outline"
              variant={dashboardStats.validHealthCards > 0 ? "primary" : "outline"}
              size="medium"
              disabled={dashboardStats.validHealthCards === 0}
              onPress={() => router.push('/(screens)/(shared)/qr-code')}
              accessibilityLabel="View Digital Card"
              accessibilityHint={dashboardStats.validHealthCards > 0 ? "View your digital health card QR code" : "No active health card available"}
            />
          </View>
        </View>

        {/* Recent Activity - Collapsible Panel */}
        {/* NEW FEATURE: Collapsible activity list with smooth animations */}
        {/* Shows 2 items by default, expands to show all with chevron animation */}
        <View style={styles.recentActivityContainer}>
          <TouchableOpacity 
            onPress={() => setExpanded(!expanded)} 
            accessibilityLabel="Toggle activity list"
            style={styles.collapsibleHeader}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.expandButtonContainer}>
                <Text style={styles.viewAllText}>
                  {expanded ? 'Show Less' : `View All (${recentActivities.length})`}
                </Text>
                <Animated.View style={{ transform: [{ rotate: rotateAnimation }] }}>
                  <Ionicons 
                    name="chevron-down" 
                    size={20} 
                    color={getColor('accent.medicalBlue')} 
                  />
                </Animated.View>
              </View>
            </View>
          </TouchableOpacity>
          
          <Animated.View style={[{ height: animatedHeight, overflow: 'hidden' }]}>
            {recentActivities.length > 0 ? (
              <View style={styles.activityList}>
                {recentActivities.map((activity, index) => (
                  <Animated.View
                    key={activity.id}
                    style={{
                      opacity: expanded || index < 2 ? 1 : 0,
                      marginBottom: getSpacing('sm'),
                    }}
                  >
                    <View style={styles.activityCard}>
                      <ActivityItem activity={activity} />
                    </View>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <EmptyState
                icon="document-outline"
                title="No recent activity"
                subtitle="Your activities will appear here"
              />
            )}
          </Animated.View>
          
          {/* View full activity link */}
          {recentActivities.length > 2 && (
            <TouchableOpacity 
              style={styles.viewFullActivityLink}
              onPress={() => router.push('/(screens)/(shared)/activity')}
              accessibilityLabel="View full activity history"
            >
              <Text style={styles.viewFullActivityText}>View Full Activity History</Text>
              <Ionicons name="arrow-forward" size={16} color={getColor('accent.medicalBlue')} />
            </TouchableOpacity>
          )}
        </View>

    </ScrollView>
    <FeedbackSystem messages={messages} onDismiss={dismissFeedback} />
    </View>
  );
}

