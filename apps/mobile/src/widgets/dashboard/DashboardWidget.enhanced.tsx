import React from 'react';
import { RefreshControl, ScrollView, View, Text, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
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
import { useHealthTip } from '@shared/hooks';
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

  // Fetch dynamic health tips
  const { healthTip, isLoading: isLoadingTip, refreshTip } = useHealthTip();

  // Use real health card data from backend (no more mock data)
  const realHealthCard = healthCard ? {
    id: healthCard._id,
    cardNumber: healthCard.registrationNumber || (healthCard as any).verificationToken || 'N/A',
    issueDate: new Date(healthCard.issuedDate || (healthCard as any).issuedAt || Date.now()).toISOString(),
    expiryDate: new Date(healthCard.expiryDate || (healthCard as any).expiresAt || Date.now()).toISOString(),
    status: (healthCard.status === 'active' || healthCard.status === 'expired' || healthCard.status === 'revoked') ? healthCard.status : 'active' as 'active' | 'expired' | 'pending',
    type: healthCard.jobCategory?.name || 'Health Card',
    fullName: healthCard.application?.firstName && healthCard.application?.lastName
      ? `${healthCard.application.firstName} ${healthCard.application.middleName || ''} ${healthCard.application.lastName}`.trim()
      : userProfile?.fullname || 'User',
    qrCodeData: `https://emedicard.davao.gov.ph/verify/${healthCard.registrationNumber || (healthCard as any).verificationToken}`,
  } : undefined;

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
          healthCard={realHealthCard}
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
              const applicationStatus = currentApplication?.status;
              const paymentStatus = currentApplication?.payment?.status;
              // 'Submitted' means payment failed/expired/cancelled, need to repay
              const isPaymentIncomplete = applicationStatus === 'Pending Payment' || applicationStatus === 'Submitted' || (!!paymentStatus && paymentStatus !== 'Complete' && paymentStatus !== 'Refunded');
              const isManualValidation = applicationStatus === 'For Payment Validation';
              
              if (!hasApplication) {
                // Check if user has completed applications (health cards)
                const totalApplications = userApplications?.length || 0;
                const hasHealthCard = dashboardStats?.validHealthCards > 0;
                
                if (hasHealthCard || totalApplications > 0) {
                  // Has completed applications or health card
                  return (
                    <PresetStatCards.Applications
                      value={totalApplications.toString()}
                      subtitle={totalApplications === 1 ? "Application" : "Applications"}
                      onPress={() => router.push('/(tabs)/application')}
                    />
                  );
                }
                
                // No application at all
                return (
                  <PresetStatCards.Applications
                    value="-"
                    subtitle="Start your journey"
                    onPress={() => router.push('/(tabs)/apply')}
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
              } else if (status === 'Scheduled') {
                statusBadge = { text: 'Scheduled', color: '#10B981' }; // Green - orientation scheduled
              } else if (status === 'For Orientation') {
                statusBadge = { text: 'Orientation', color: '#10B981' }; // Green - ready
              } else if (status === 'For Document Verification') {
                statusBadge = { text: 'Doc Review', color: '#6366F1' }; // Indigo
              } else if (status === 'For Payment Validation') {
                statusBadge = { text: 'Validating', color: '#8B5CF6' }; // Purple
              } else if (status === 'Approved' || status === 'Completed') {
                statusBadge = { text: 'Approved', color: '#059669' }; // Clean green
              } else if (status === 'Under Review' || status === 'Submitted') {
                statusBadge = { text: 'In Review', color: '#2563EB' }; // Blue
              } else if (status === 'Under Administrative Review' || status === 'Locked - Max Attempts') {
                statusBadge = { text: 'Admin Review', color: '#DC2626' }; // Red - requires attention
              }
              
              if (isPaymentIncomplete && !isManualValidation) {
                statusBadge = undefined;
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
              const applicationStatus = currentApplication?.status;
              const paymentStatus = currentApplication?.payment?.status;
              // 'Submitted' means payment failed/expired/cancelled, need to repay
              const isPaymentIncomplete = applicationStatus === 'Pending Payment' || applicationStatus === 'Submitted' || (!!paymentStatus && paymentStatus !== 'Complete' && paymentStatus !== 'Refunded');
              const isManualValidation = applicationStatus === 'For Payment Validation';
              
              if (!hasApplication) {
                // Check if user has health card (means documents were approved)
                const hasHealthCard = dashboardStats?.validHealthCards > 0;
                
                if (hasHealthCard) {
                  // Documents were approved (health card issued)
                  return (
                    <PresetStatCards.DocumentVerification
                      value="✓"
                      subtitle="Documents approved"
                      onPress={() => router.push('/(tabs)/application')}
                    />
                  );
                }
                
                // No application yet
                return (
                  <PresetStatCards.DocumentVerification
                    value="-"
                    subtitle="Start your application"
                    onPress={() => router.push('/(tabs)/apply')}
                  />
                );
              }
              
              // Get document counts and application status
              const totalDocs = currentApplication?.documentCount || 0;
              const allVerified = currentApplication?.documentsVerified || false;
              const status = currentApplication?.status || '';
              
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
              
              if (isPaymentIncomplete && !isManualValidation) {
                // Don't show review states while payment is incomplete
                statusValue = String(totalDocs);
                statusText = 'Complete payment to continue';
                statusBadge = undefined;
                cardGradient = [theme.colors.indigo[500], theme.colors.indigo[600]];
              } else if (status === 'Approved' || allVerified) {
                // All documents verified
                statusValue = '✓';
                statusText = 'All documents approved';
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
              const cardExpiryDate = realHealthCard?.expiryDate || healthCard?.expiryDate;
              
              if (!hasValidCard || !cardExpiryDate) {
                // No active card
                return (
                  <PresetStatCards.HealthCard
                    value="-"
                    subtitle={isNewUser ? "Apply for your card" : "No active card"}
                    onPress={() => isNewUser ? router.push('/(tabs)/apply') : router.push('/(tabs)/application')}
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
              
              // Check for active renewal application (terminal statuses that can't have renewals)
              const terminalStatuses = ['Approved', 'Cancelled', 'Payment Rejected', 'Referred for Medical Management'];
              const activeRenewal = userApplications?.find((app: any) => 
                app.applicationType === 'Renew' && 
                !terminalStatuses.includes(app.status)
              );
              
              // Determine status and styling
              let statusValue: string;
              let statusText: string;
              let statusBadge: { text: string; color: string } | undefined;
              let cardGradient: [string, string] | undefined;
              
              if (daysUntilExpiry < 0) {
                // Expired - URGENT RENEWAL
                statusValue = 'Expired';
                statusText = 'Renew now';
                statusBadge = { text: 'RENEW NOW', color: theme.colors.red[700] };
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
              
              // Add renewal status to subtitle if there's an active renewal
              if (activeRenewal) {
                const renewalStatusMap: Record<string, string> = {
                  'Pending Payment': 'Payment Due',
                  'For Payment Validation': 'Payment Validating',
                  'Submitted': 'Submitted',
                  'Scheduled': 'Orientation Scheduled',
                  'For Document Verification': 'Documents Review',
                  'Under Review': 'Under Review',
                  'Documents Need Revision': 'Docs Needed',
                  'For Orientation': 'Orientation Pending',
                };
                const renewalStatus = renewalStatusMap[activeRenewal.status] || activeRenewal.status;
                statusText = `${statusText}\n🔄 Renewal: ${renewalStatus}`;
              }
              
              return (
                <PresetStatCards.HealthCard
                  value={statusValue}
                  subtitle={statusText}
                  onPress={() => {
                    // If there's an active renewal, go to application details
                    if (activeRenewal) {
                      router.push('/(tabs)/application');
                    } else if (daysUntilExpiry <= 30) {
                      // Navigate to card selection for renewal
                      router.push('/(screens)/(shared)/renewal/select-card');
                    } else {
                      router.push('/(screens)/(shared)/health-cards');
                    }
                  }}
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
                {isLoadingTip ? (
                  <ActivityIndicator size="small" color={theme.colors.blue[600]} style={{ marginTop: moderateScale(8) }} />
                ) : (
                  <>
                    <Text style={styles.infoCardDescription}>
                      {healthTip?.content || 'Take care of your body. It\'s the only place you have to live.'}
                    </Text>
                    {healthTip?.author && (
                      <Text style={[styles.infoCardDescription, {
                        fontSize: moderateScale(12),
                        fontStyle: 'italic',
                        marginTop: moderateScale(4),
                        color: theme.colors.text.tertiary
                      }]}>
                        — {healthTip.author}
                      </Text>
                    )}
                  </>
                )}
              </View>
              <TouchableOpacity
                onPress={refreshTip}
                style={{
                  padding: moderateScale(8),
                  borderRadius: moderateScale(20),
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                }}
                disabled={isLoadingTip}
              >
                <Ionicons
                  name="refresh"
                  size={moderateScale(20)}
                  color={theme.colors.blue[600]}
                />
              </TouchableOpacity>
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
