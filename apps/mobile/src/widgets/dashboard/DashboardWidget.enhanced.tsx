import React from 'react';
import { RefreshControl, ScrollView, View, Text, Animated, TouchableOpacity } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient'; // Disabled due to native module issues
import { Ionicons } from '@expo/vector-icons';
import { 
  OfflineBanner,
  WelcomeBanner,
  PriorityAlerts,
  RecentActivityList,
  ActionCenter,
} from '@features/dashboard/components';
import { DashboardHeaderEnhanced } from '@features/dashboard/components/DashboardHeader/DashboardHeader.enhanced';
import { HealthCardPreview } from '@features/dashboard/components/HealthCardPreview/HealthCardPreview';
import { StatCardEnhanced, PresetStatCards } from '@features/dashboard/components/StatCard/StatCard.enhanced';
import { QuickActionsCarousel } from '@features/dashboard/components/QuickActionsCarousel/QuickActionsCarousel';
import { router } from 'expo-router';
import { styles } from './DashboardWidget.enhanced.styles';
import { theme } from '@shared/styles/theme';
import { moderateScale } from '@shared/utils/responsive';

interface DashboardWidgetEnhancedProps {
  data: {
    user: any;
    userProfile: any;
    userApplications: any;
    dashboardStats: any;
    recentActivities: any;
    currentTime: Date;
    unreadNotificationsCount: number;
    isLoading: boolean;
    refreshing: boolean;
    currentApplication: any;
    isNewUser: boolean;
    healthCard?: any;
  };
  handlers: {
    onRefresh: () => void;
    getGreeting: () => string;
  };
  isOnline: boolean;
}

export function DashboardWidgetEnhanced({ data, handlers, isOnline }: DashboardWidgetEnhancedProps) {
  const {
    userProfile,
    dashboardStats,
    recentActivities,
    currentTime,
    unreadNotificationsCount,
    refreshing,
    currentApplication,
    isNewUser,
    userApplications,
    healthCard,
  } = data;
  
  const { onRefresh, getGreeting } = handlers;

  // Mock health card data for demo - replace with actual data
  const mockHealthCard = healthCard || (dashboardStats?.validHealthCards > 0 ? {
    id: '1',
    cardNumber: 'HC-2025-001234',
    issueDate: '2025-01-01',
    expiryDate: '2026-01-01',
    status: 'active',
    type: 'Medical Health Card',
    fullName: userProfile?.fullName || 'John Doe',
    qrCodeData: 'HC-2025-001234|MEDICAL|2026-01-01',
  } : null);

  return (
    <View style={styles.container}>
      <OfflineBanner isOnline={isOnline} />
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
            colors={[theme.colors.primary[500]]}
          />
        }
        showsVerticalScrollIndicator={false}
        testID="dashboard-scroll-view"
      >
        {/* Enhanced Header with Profile */}
        <DashboardHeaderEnhanced
          userProfile={userProfile}
          greeting={getGreeting()}
          currentTime={currentTime}
          unreadNotificationsCount={unreadNotificationsCount}
        />

        {/* Welcome Banner for New Users */}
        <WelcomeBanner isNewUser={isNewUser} />
        
        {/* Priority Alerts */}
        <PriorityAlerts
          dashboardStats={dashboardStats}
          currentApplication={currentApplication}
        />
        
        {/* Health Card Preview or Application Status */}
        <HealthCardPreview
          healthCard={mockHealthCard}
          currentApplication={currentApplication}
          userProfile={userProfile}
        />

        {/* Action Center - Consolidated priority actions */}
        <ActionCenter
          currentApplication={currentApplication}
          dashboardStats={dashboardStats}
        />
        
        {/* Quick Actions Carousel */}
        <QuickActionsCarousel
          userApplications={userApplications}
          dashboardStats={dashboardStats}
          currentApplication={currentApplication}
        />

        {/* Information Cards Section */}
        <View style={styles.infoCardsSection}>
          <Text style={styles.sectionTitle}>Helpful Information</Text>
          
          {/* Upcoming Appointments Card */}
          {currentApplication?.needsOrientation && (
            <TouchableOpacity 
              style={styles.infoCard}
              onPress={() => router.push('/(screens)/(shared)/orientation')}
            >
              <View
                style={[styles.infoCardGradient, { backgroundColor: theme.colors.orange[50] }]}
              >
                <View style={styles.infoCardIcon}>
                  <Ionicons name="calendar" size={moderateScale(24)} color={theme.colors.orange[600]} />
                </View>
                <View style={styles.infoCardContent}>
                  <Text style={styles.infoCardTitle}>Food Safety Orientation</Text>
                  <Text style={styles.infoCardDescription}>Required for food handlers</Text>
                </View>
                <Ionicons name="chevron-forward" size={moderateScale(20)} color={theme.colors.orange[600]} />
              </View>
            </TouchableOpacity>
          )}
          
          {/* Health Tips Card */}
          <View style={styles.healthTipsCard}>
            <View
              style={[styles.infoCardGradient, { backgroundColor: theme.colors.blue[50] }]}
            >
              <View style={styles.infoCardIcon}>
                <Ionicons name="heart" size={moderateScale(24)} color={theme.colors.blue[600]} />
              </View>
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardTitle}>Health Tip of the Day</Text>
                <Text style={styles.infoCardDescription}>
                  Stay hydrated! Drink at least 8 glasses of water daily.
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Recent Activity */}
        <RecentActivityList recentActivities={recentActivities} />
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
}
