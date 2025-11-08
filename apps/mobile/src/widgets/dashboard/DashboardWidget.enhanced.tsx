import React from 'react';
import { RefreshControl, ScrollView, View, Text, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  OfflineBanner,
  WelcomeBanner,
  RecentActivityList,
  ActionCenter,
} from '@features/dashboard/components';
import { HealthCardPreview } from '@features/dashboard/components/HealthCardPreview/HealthCardPreview';
import { PresetStatCards } from '@features/dashboard/components/StatCard/StatCard.enhanced';
import { QuickActionsCarousel } from '@features/dashboard/components/QuickActionsCarousel/QuickActionsCarousel';
import { router } from 'expo-router';
// Phase 4 Migration: Use new referral hooks for proper medical terminology
import { useReferredDocumentsCount } from '@features/document-rejection/hooks';
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

  // Use referral counts (medical vs document issues)
  const referralCounts = useReferredDocumentsCount(data?.userProfile?._id);
  const { totalIssues, medicalReferrals, documentIssues } = referralCounts;

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
        {/* Inline Header Section */}
        <View style={styles.inlineHeaderSection}>
          <View style={styles.inlineHeader}>
            <Text style={styles.pageTitle}>Overview</Text>
            <Text style={styles.greeting}>
              {getGreeting()}, {data.user?.firstName || userProfile?.fullname || 'User'}
            </Text>
          </View>
        </View>

        {/* Welcome Banner for New Users */}
        <WelcomeBanner isNewUser={isNewUser} />
        
        {/* Action Center - URGENT items requiring immediate attention */}
        <ActionCenter
          currentApplication={currentApplication}
          dashboardStats={dashboardStats}
          userApplications={userApplications}
          medicalReferralsCount={medicalReferrals}
          documentIssuesCount={documentIssues}
        />
        
        {/* Health Card Preview or Application Status */}
        <HealthCardPreview
          healthCard={mockHealthCard}
          currentApplication={currentApplication}
          userProfile={userProfile}
          isNewUser={isNewUser}
        />

        {/* Quick Stats Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            {(() => {
              // Application Summary Logic
              const hasApplication = currentApplication !== null;
              
              if (!hasApplication) {
                // No application
                return (
                  <PresetStatCards.Applications
                    value="-"
                    subtitle={isNewUser ? "Start your journey" : "No active application"}
                    onPress={() => router.push(isNewUser ? '/(tabs)/apply' : '/(tabs)/application')}
                  />
                );
              }
              
              // Show application type
              const applicationType = currentApplication?.applicationType || 'New';
              
              // Always use blue gradient
              const cardGradient: [string, string] = [theme.colors.blue[500], theme.colors.blue[600]];
              
              // Status badge - smaller, cleaner styling
              let statusBadge: { text: string; color: string } | undefined;
              const status = currentApplication?.status || '';
              
              if (status === 'Pending Payment') {
                statusBadge = { text: 'Payment Due', color: '#DC2626' }; // Clean red
              } else if (status === 'Referred for Medical Management') {
                statusBadge = { text: 'Medical Referral', color: '#3B82F6' }; // Blue - medical
              } else if (status === 'Documents Need Revision') {
                statusBadge = { text: 'Docs Needed', color: '#F59E0B' };
              } else if (status === 'Approved' || status === 'Completed') {
                statusBadge = { text: 'Approved', color: '#059669' }; // Clean green
              } else if (status === 'Under Review' || status === 'Submitted') {
                statusBadge = { text: 'In Review', color: '#2563EB' }; // Blue
              }
              
              return (
                <PresetStatCards.Applications
                  value={applicationType === 'Renew' ? 'Renewal' : 'New'}
                  subtitle="Application"
                  onPress={() => router.push('/(tabs)/application')}
                  badge={statusBadge}
                  gradient={cardGradient}
                />
              );
            })()}
            {(() => {
              // Document Verification Logic
              const hasApplication = currentApplication !== null;
              
              if (!hasApplication) {
                // No application yet
                return (
                  <PresetStatCards.DocumentVerification
                    value="-"
                    subtitle={isNewUser ? "Start your application" : "No active application"}
                    onPress={() => router.push(isNewUser ? '/(tabs)/apply' : '/(tabs)/application')}
                  />
                );
              }
              
              // Get document counts from current application
              const totalDocs = currentApplication?.documentCount || 0;
              const allVerified = currentApplication?.documentsVerified || false;
              
              if (totalDocs === 0) {
                // Documents not uploaded yet (edge case)
                return (
                  <PresetStatCards.DocumentVerification
                    value="0"
                    subtitle="Upload required documents"
                    onPress={() => router.push(`/(screens)/(shared)/documents/view-document?formId=${currentApplication._id}`)}
                    badge={{ text: 'Action Required', color: theme.colors.orange[700] }}
                  />
                );
              }
              
              // Determine verification status
              let statusValue: string;
              let statusText: string;
              let statusBadge: { text: string; color: string } | undefined;
              let cardGradient: [string, string] | undefined;
              
              if (allVerified) {
                // All documents verified
                statusValue = '✓';
                statusText = 'All documents verified';
                cardGradient = [theme.colors.primary[500], theme.colors.primary[600]];
              } else {
                // Documents pending verification
                statusValue = String(totalDocs);
                statusText = 'Awaiting admin review';
                statusBadge = { text: 'Under Review', color: theme.colors.indigo[700] };
                cardGradient = [theme.colors.indigo[500], theme.colors.indigo[600]];
              }
              
              return (
                <PresetStatCards.DocumentVerification
                  value={statusValue}
                  subtitle={statusText}
                  onPress={() => router.push(`/(screens)/(shared)/documents/view-document?formId=${currentApplication._id}`)}
                  badge={statusBadge}
                  gradient={cardGradient}
                />
              );
            })()}
            {(() => {
              // Health Card Comprehensive Logic (Possession + Validity)
              const hasValidCard = dashboardStats?.validHealthCards > 0;
              const cardExpiryDate = mockHealthCard?.expiryDate || healthCard?.expiryDate;
              
              if (!hasValidCard || !cardExpiryDate) {
                // No active card
                return (
                  <PresetStatCards.HealthCard
                    value="-"
                    subtitle={isNewUser ? "Apply for your card" : "No active card"}
                    onPress={() => {}}
                  />
                );
              }
              
              // Calculate days until expiration
              const expiryTime = new Date(cardExpiryDate).getTime();
              const currentTimeMs = currentTime.getTime();
              const daysUntilExpiry = Math.ceil((expiryTime - currentTimeMs) / (1000 * 60 * 60 * 24));
              
              // Format expiry date
              const expiryDateFormatted = new Date(cardExpiryDate).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
              });
              
              // Determine status and styling
              let statusValue: string;
              let statusText: string;
              let statusBadge: { text: string; color: string } | undefined;
              let cardGradient: [string, string] | undefined;
              
              if (daysUntilExpiry < 0) {
                // Expired
                statusValue = 'Expired';
                statusText = 'Renew required';
                statusBadge = { text: 'Expired', color: theme.colors.red[700] };
                cardGradient = [theme.colors.red[500], theme.colors.red[600]];
              } else if (daysUntilExpiry <= 7) {
                // Expiring soon (< 7 days)
                statusValue = `${daysUntilExpiry}d`;
                statusText = `Expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}`;
                statusBadge = { text: 'Urgent', color: theme.colors.red[700] };
                cardGradient = [theme.colors.orange[500], theme.colors.orange[600]];
              } else if (daysUntilExpiry <= 30) {
                // Expires soon (7-30 days)
                statusValue = `${daysUntilExpiry}d`;
                statusText = `Expires in ${daysUntilExpiry} days`;
                statusBadge = { text: 'Renew Soon', color: theme.colors.orange[700] };
                cardGradient = [theme.colors.orange[400], theme.colors.orange[500]];
              } else {
                // Valid (> 30 days)
                statusValue = '✅'; // Green check emoji
                statusText = `Valid until ${expiryDateFormatted}`;
                cardGradient = [theme.colors.primary[500], theme.colors.primary[600]];
              }
              
              return (
                <PresetStatCards.HealthCard
                  value={statusValue}
                  subtitle={statusText}
                  onPress={() => {}}
                  badge={statusBadge}
                  gradient={cardGradient}
                />
              );
            })()}
          </View>
        </View>

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
              onPress={() => router.push(`/(screens)/(shared)/orientation/schedule?applicationId=${currentApplication._id}`)}
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
