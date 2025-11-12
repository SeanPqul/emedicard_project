import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ApplicationDetails, PaymentMethod } from '@entities/application';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';
import { styles } from './ApplicationDetailWidget.styles';
import { theme } from '@shared/styles/theme';
import MayaLogo from '@/assets/svgs/maya-logo-brandlogos.net_gpvn1r359.svg';
import GCashLogo from '@/assets/svgs/gcash-logo-brandlogos.net_arv9ck6s2.svg';
import { usePaymentRejectionHistory } from '@features/payment';

// UI constants for status colors (Phase 4 Migration: Added new statuses)
const STATUS_COLORS = {
  'Pending Payment': '#FFA500',
  'Payment Rejected': '#DC2626',
  'For Payment Validation': '#F5A623',
  'For Orientation': theme.colors.accent.warningOrange,
  'Submitted': '#2E86AB',
  'Under Review': '#F18F01',
  'Approved': '#28A745',
  'Rejected': '#DC3545', // DEPRECATED
  // NEW - Phase 4 Migration
  'Documents Need Revision': '#F59E0B', // Orange - document issues
  'Referred for Medical Management': '#3B82F6', // Blue - medical referrals
} as const;

interface ApplicationDetailWidgetProps {
  application: ApplicationDetails;
  refreshing: boolean;
  onRefresh: () => void;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  isPaymentProcessing: boolean;
  isPaymentStatusProcessing: boolean;
  getStatusIcon: (status: string) => string;
  getUrgencyColor: (daysLeft: number | null) => string;
  rejectedDocumentsCount?: number;
  applicationId: string;
}

export function ApplicationDetailWidget({
  application,
  refreshing,
  onRefresh,
  onPaymentMethodSelect,
  isPaymentProcessing,
  isPaymentStatusProcessing,
  getStatusIcon,
  getUrgencyColor,
  rejectedDocumentsCount = 0,
  applicationId,
}: ApplicationDetailWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRejectionHistoryModalOpen, setIsRejectionHistoryModalOpen] = useState(false);

  // Payment rejection history hook
  const {
    latestRejection,
    rejectionHistory,
    rejectionCount,
    hasRejections,
    isLoading: isLoadingRejections,
  } = usePaymentRejectionHistory(applicationId);

  // Determine if current payment is manual (only manual payments can be rejected)
  const isManualPayment = application.payment?.method === 'BaranggayHall' ||
                          application.payment?.method === 'CityHall';

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  // Define collapsible rows data
  const collapsibleRows = [
    { label: 'Middle Name', value: application.form?.middleName || 'N/A' },
    { label: 'Last Name', value: application.form?.lastName },
    { label: 'Age', value: application.form?.age },
    { label: 'Nationality', value: application.form?.nationality },
    { label: 'Gender', value: application.form?.gender },
    { label: 'Position', value: application.form?.position },
    { label: 'Organization', value: application.form?.organization },
    { label: 'Civil Status', value: application.form?.civilStatus },
  ];

  const statusColor = STATUS_COLORS[application.status as keyof typeof STATUS_COLORS] ?? theme.colors.primary[500];

  const getDaysUntilDeadline = (deadline?: number) => {
    if (!deadline) return null;
    const now = Date.now();
    const diff = deadline - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntilDeadline = getDaysUntilDeadline(application.paymentDeadline);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Minimal Header with Back Button */}
        <View style={styles.inlineHeaderSection}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/application')}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.pageTitle}>Application Details</Text>
              <Text style={styles.applicationIdSubtitle}>#{application._id.slice(-8).toUpperCase()}</Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>
        </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        {/* Dynamic layout: show ID on same row for short statuses, separate row for long ones */}
        {application.status.length > 20 ? (
          // Long status - ID below
          <>
            <View style={styles.statusHeader}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <Ionicons name={getStatusIcon(application.status) as any} size={moderateScale(18)} color={statusColor} />
                <Text style={[styles.statusText, { color: statusColor }]} numberOfLines={1}>
                  {application.status}
                </Text>
              </View>
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Application ID</Text>
              <Text style={styles.statusValue}>#{application._id.slice(-8).toUpperCase()}</Text>
            </View>
          </>
        ) : (
          // Short status - ID on same row
          <View style={styles.statusHeaderWithId}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Ionicons name={getStatusIcon(application.status) as any} size={moderateScale(18)} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {application.status}
              </Text>
            </View>
            <Text style={styles.applicationId}>#{application._id.slice(-8).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.statusInfo}>
          <Text style={styles.statusLabel}>Application Date</Text>
          <Text style={styles.statusValue}>
            {new Date(application._creationTime).toLocaleDateString()}
          </Text>
        </View>

        {application.status === 'Pending Payment' && daysUntilDeadline !== null && (
          <View style={styles.deadlineContainer}>
            <Ionicons
              name="time-outline"
              size={moderateScale(16)}
              color={getUrgencyColor(daysUntilDeadline)}
            />
            <Text style={[styles.deadlineText, { color: getUrgencyColor(daysUntilDeadline) }]}>
              {daysUntilDeadline <= 0
                ? 'Payment overdue!'
                : daysUntilDeadline === 1
                ? 'Payment due tomorrow'
                : `${daysUntilDeadline} days left to pay`}
            </Text>
          </View>
        )}
      </View>

      {/* Payment Rejection Banner - ONLY for manual payments */}
      {application.status === 'Payment Rejected' && isManualPayment && latestRejection && (
        <View style={styles.paymentRejectionBanner}>
          <View style={styles.rejectionBannerHeader}>
            <View style={styles.rejectionIconContainer}>
              <Ionicons name="alert-circle" size={moderateScale(24)} color="#FFFFFF" />
            </View>
            <View style={styles.rejectionHeaderContent}>
              <Text style={styles.rejectionTitle}>Payment Rejected</Text>
              <View style={styles.rejectionAttemptBadge}>
                <Text style={styles.rejectionAttemptText}>
                  Attempt {latestRejection.attemptNumber} of 3
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.rejectionCategoryTag}>
            <Text style={styles.rejectionCategoryText}>
              {latestRejection.rejectionCategory.replace(/_/g, ' ')}
            </Text>
          </View>

          <View style={styles.rejectionReasonContainer}>
            <Text style={styles.rejectionReasonLabel}>Reason:</Text>
            <Text style={styles.rejectionReasonText}>{latestRejection.rejectionReason}</Text>
          </View>

          {latestRejection.specificIssues && latestRejection.specificIssues.length > 0 && (
            <View style={styles.rejectionIssuesList}>
              {latestRejection.specificIssues.map((issue, index) => (
                <View key={index} style={styles.rejectionIssueItem}>
                  <View style={styles.rejectionIssueBullet} />
                  <Text style={styles.rejectionIssueText}>{issue}</Text>
                </View>
              ))}
            </View>
          )}

          {rejectionCount > 1 && (
            <TouchableOpacity
              style={styles.viewHistoryButton}
              onPress={() => setIsRejectionHistoryModalOpen(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={moderateScale(16)} color="#DC2626" />
              <Text style={styles.viewHistoryButtonText}>
                View History ({rejectionCount} attempts)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Application Details - Collapsible */}
      <View style={styles.detailsCard}>
        <View style={styles.collapsibleHeader}>
          <Text style={styles.sectionTitle}>Application Information</Text>
        </View>

        {/* Always visible items */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{application.form?.applicationType} Application</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Job Category</Text>
          <View style={styles.categoryContainer}>
            <View
              style={[
                styles.categoryIndicator,
                { backgroundColor: application.jobCategory?.colorCode }
              ]}
            />
            <Text style={styles.detailValue}>{application.jobCategory?.name}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>First Name</Text>
          <Text style={styles.detailValue}>{application.form?.firstName}</Text>
        </View>

        {/* Collapsible content with smooth fade animations */}
        {!isExpanded && (
          <Animated.View exiting={FadeOut.duration(150)}>
            <View style={[styles.detailRow, styles.fadedRow]}>
              <Text style={styles.detailLabel}>Middle Name</Text>
              <Text style={styles.detailValue}>{application.form?.middleName || 'N/A'}</Text>
            </View>
          </Animated.View>
        )}

        {/* Expanded content with staggered fade-in (no layout animation to avoid conflicts) */}
        {isExpanded && collapsibleRows.map((row, index) => (
          <Animated.View
            key={row.label}
            entering={FadeIn.delay(index * 60).duration(300)}
            exiting={FadeOut.duration(150)}
            style={styles.detailRow}
          >
            <Text style={styles.detailLabel}>{row.label}</Text>
            <Text style={styles.detailValue}>{row.value}</Text>
          </Animated.View>
        ))}

        {/* Bottom toggle button */}
        <TouchableOpacity
          onPress={toggleExpanded}
          activeOpacity={0.7}
          style={isExpanded ? styles.collapseButton : styles.expandButton}
        >
          {!isExpanded && <View style={styles.expandButtonShadow} />}
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={moderateScale(24)}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* Documents Section */}
      <View style={styles.documentsCard}>
        <Text style={styles.sectionTitle}>Submitted Documents</Text>

        <TouchableOpacity
          style={styles.viewDocumentsButton}
          onPress={() => router.push(`/(screens)/(shared)/documents/view-document?formId=${application._id}`)}
        >
          <View style={styles.documentsIconContainer}>
            <Ionicons name="document-text-outline" size={moderateScale(20)} color="#666" />
          </View>
          <View style={styles.documentsInfo}>
            <Text style={styles.viewDocumentsText}>View Uploaded Documents</Text>
            {application.status === 'Pending Payment' && (
              <Text style={styles.documentsStatusText}>Will be verified after payment</Text>
            )}
            {application.status === 'Submitted' && (
              <Text style={styles.documentsStatusText}>Waiting for verification</Text>
            )}
            {application.status === 'Under Review' && (
              <Text style={[styles.documentsStatusText, { color: theme.colors.primary[500] }]}>Currently being verified</Text>
            )}
            {application.status === 'Approved' && (
              <Text style={[styles.documentsStatusText, { color: theme.colors.accent.safetyGreen }]}>All documents approved</Text>
            )}
            {/* Show appropriate message based on status */}
            {application.status === 'Referred for Medical Management' && (
              <Text style={[styles.documentsStatusText, { color: '#3B82F6' }]}>
                Medical referral - see doctor for clearance
              </Text>
            )}
            {application.status === 'Documents Need Revision' && rejectedDocumentsCount > 0 && (
              <Text style={[styles.documentsStatusText, { color: '#F59E0B' }]}>
                {rejectedDocumentsCount} document{rejectedDocumentsCount !== 1 ? 's' : ''} need correction
              </Text>
            )}
            {/* DEPRECATED: Legacy rejection message (backward compatibility) - Don't show if Approved */}
            {rejectedDocumentsCount > 0 && application.status !== 'Referred for Medical Management' && application.status !== 'Documents Need Revision' && application.status !== 'Approved' && (
              <Text style={[styles.documentsStatusText, { color: theme.colors.semantic.error }]}>
                {rejectedDocumentsCount} document{rejectedDocumentsCount !== 1 ? 's' : ''} need revision
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Orientation Section - Show for Food Handlers who need orientation (parallel with doc verification) */}
      {(() => {
        // Check if this is a food handler
        const isFoodHandler = application.jobCategory?.name?.toLowerCase().includes('food');
        const requiresOrientation = isFoodHandler && (application.jobCategory?.requireOrientation === true || application.jobCategory?.requireOrientation === 'Yes');
        const orientationCompleted = (application as any)?.orientationCompleted === true;

        // Show orientation section if:
        // 1. Job category requires orientation (Food Handler)
        // 2. Orientation hasn't been completed yet
        // 3. Payment has been validated (NOT waiting for validation)
        // 4. Status is not Rejected, Cancelled, or Approved
        const shouldShowOrientation = requiresOrientation && !orientationCompleted &&
          !['Pending Payment', 'For Payment Validation', 'Payment Rejected', 'Rejected', 'Cancelled', 'Approved', 'Referred for Medical Management', 'Documents Need Revision'].includes(application.status);

        return shouldShowOrientation;
      })() && (
        <View style={styles.orientationCard}>
          <Text style={styles.sectionTitle}>Orientation Required</Text>

          <TouchableOpacity
            style={styles.viewDocumentsButton}
            onPress={() => router.push(`/(screens)/(shared)/orientation/schedule?applicationId=${application._id}`)}
          >
            <View style={styles.documentsIconContainer}>
              <Ionicons name="calendar-outline" size={moderateScale(20)} color="#666" />
            </View>
            <View style={styles.documentsInfo}>
              <Text style={styles.viewDocumentsText}>Schedule Orientation Session</Text>
              <Text style={styles.documentsStatusText}>
                Complete your mandatory orientation to proceed
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Section - Show for pending payment OR rejected manual payments OR submitted applications */}
      {(application.status === 'Pending Payment' || application.status === 'Submitted' ||
       (application.status === 'Payment Rejected' && isManualPayment)) && (
        <View style={styles.paymentCard}>
          {/* Resubmit Warning for Payment Rejected status */}
          {application.status === 'Payment Rejected' && (
            <View style={styles.resubmitWarningBanner}>
              <Text style={styles.resubmitWarningText}>
                ⚠️ Your previous payment was rejected. Please correct the issues above and resubmit with a clearer receipt.
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>
            {application.status === 'Payment Rejected' ? 'Resubmit Payment' : 'Payment Required'}
          </Text>

          <Text style={styles.paymentDescription}>
            Complete your payment to proceed with your health card application
          </Text>

          {/* Fee Breakdown */}
          <View style={styles.feeBreakdown}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Application Fee</Text>
              <Text style={styles.feeValue}>₱50.00</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Service Fee</Text>
              <Text style={styles.feeValue}>₱10.00</Text>
            </View>
            <View style={[styles.feeRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₱60.00</Text>
            </View>
          </View>

          {/* Payment Methods */}
          <Text style={styles.paymentMethodsTitle}>Select Payment Method</Text>
          <Text style={styles.paymentMethodsSubtitle}>Choose how you want to pay</Text>

          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[styles.paymentMethodCard, isPaymentProcessing && styles.paymentMethodCardDisabled]}
              onPress={() => onPaymentMethodSelect('Maya')}
              disabled={isPaymentProcessing}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodBadge}>
                <Text style={styles.paymentMethodBadgeText}>RECOMMENDED</Text>
              </View>
              <View style={styles.paymentMethodIconContainer}>
                <MayaLogo width={moderateScale(40)} height={moderateScale(30)} />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>Maya</Text>
                <Text style={styles.paymentMethodDescription}>Pay with Maya (Card, QR, Wallet)</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentMethodCard, isPaymentProcessing && styles.paymentMethodCardDisabled]}
              onPress={() => onPaymentMethodSelect('BaranggayHall')}
              disabled={isPaymentProcessing}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodIconContainer}>
                <Ionicons name="business-outline" size={moderateScale(28)} color={theme.colors.accent.warningOrange} />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>Barangay Hall</Text>
                <Text style={styles.paymentMethodDescription}>Pay at barangay hall in Davao City</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentMethodCard, isPaymentProcessing && styles.paymentMethodCardDisabled]}
              onPress={() => onPaymentMethodSelect('CityHall')}
              disabled={isPaymentProcessing}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodIconContainer}>
                <Ionicons name="home-outline" size={moderateScale(28)} color={theme.colors.accent.safetyGreen} />
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>Sangunian Hall</Text>
                <Text style={styles.paymentMethodDescription}>Pay at the Sanggunian hall</Text>
              </View>
            </TouchableOpacity>
          </View>

          {isPaymentProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary[500]} />
              <Text style={styles.processingText}>Processing payment...</Text>
            </View>
          )}

          {/* Payment Instructions */}
          <View style={styles.paymentInstructions}>
            <Ionicons name="information-circle-outline" size={moderateScale(14)} color={theme.colors.primary[500]} />
            <Text style={styles.paymentInstructionText}>
              After selecting a payment method, you&apos;ll be redirected to complete the payment process.
            </Text>
          </View>
        </View>
      )}

      {/* Payment History - if payment exists */}
      {application.payment && (
        <View style={styles.paymentHistoryCard}>
          <Text style={styles.sectionTitle}>Payment Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{application.payment.method}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid</Text>
            <Text style={styles.detailValue}>₱{application.payment.netAmount}</Text>
          </View>

          {application.payment.referenceNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference Number</Text>
              <Text style={styles.detailValue}>{application.payment.referenceNumber}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status</Text>
            {(() => {
              const status = (application.payment as any).status as string;
              const color = status === 'Complete'
                ? theme.colors.accent.safetyGreen
                : status === 'Pending'
                ? theme.colors.orange[600]
                : status === 'Processing'
                ? theme.colors.blue[500]
                : theme.colors.semantic.error; // Cancelled / Failed / Expired
              return (
                <View style={[styles.paymentStatusBadge, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.paymentStatusText, { color }]}>
                    {status}
                  </Text>
                </View>
              );
            })()}
          </View>
        </View>
      )}

      {/* Remarks - if any */}
      {application.remarks && (
        <View style={styles.remarksCard}>
          <Text style={styles.sectionTitle}>Remarks</Text>
          <Text style={styles.remarksText}>{application.remarks}</Text>
        </View>
      )}
    </ScrollView>

    {/* Payment Rejection History Modal */}
    <Modal
      visible={isRejectionHistoryModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsRejectionHistoryModalOpen(false)}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
        onPress={() => setIsRejectionHistoryModalOpen(false)}
      >
        <Pressable
          style={{
            backgroundColor: theme.colors.background.primary,
            borderTopLeftRadius: moderateScale(20),
            borderTopRightRadius: moderateScale(20),
            paddingTop: verticalScale(20),
            maxHeight: '80%',
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: scale(20),
            paddingBottom: verticalScale(16),
            borderBottomWidth: 1,
            borderBottomColor: '#E5E5E5',
          }}>
            <Text style={{
              fontSize: moderateScale(18),
              fontWeight: '600',
              color: theme.colors.text.primary,
            }}>
              Payment History
            </Text>
            <TouchableOpacity onPress={() => setIsRejectionHistoryModalOpen(false)}>
              <Ionicons name="close" size={moderateScale(24)} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: '80%' }}>
            {rejectionHistory.map((rejection, index) => (
              <View
                key={rejection._id}
                style={{
                  padding: moderateScale(16),
                  borderBottomWidth: 1,
                  borderBottomColor: '#F0F0F0',
                  backgroundColor: rejection.wasReplaced ? '#F0FDF4' : '#FEF2F2',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) }}>
                  <View style={{
                    backgroundColor: '#DC2626',
                    paddingHorizontal: scale(10),
                    paddingVertical: verticalScale(4),
                    borderRadius: theme.borderRadius.full,
                  }}>
                    <Text style={{
                      fontSize: moderateScale(11),
                      fontWeight: '600',
                      color: '#FFFFFF',
                    }}>
                      Attempt #{rejection.attemptNumber}
                    </Text>
                  </View>
                  {rejection.wasReplaced && (
                    <View style={{
                      backgroundColor: '#10B981',
                      paddingHorizontal: scale(10),
                      paddingVertical: verticalScale(4),
                      borderRadius: theme.borderRadius.full,
                    }}>
                      <Text style={{
                        fontSize: moderateScale(11),
                        fontWeight: '600',
                        color: '#FFFFFF',
                      }}>
                        ✓ Replaced
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={{
                  fontSize: moderateScale(12),
                  color: theme.colors.text.secondary,
                  marginBottom: verticalScale(8),
                }}>
                  {new Date(rejection.rejectedAt).toLocaleString()}
                </Text>

                <Text style={{
                  fontSize: moderateScale(13),
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  marginBottom: verticalScale(4),
                }}>
                  {rejection.rejectionCategory.replace(/_/g, ' ').toUpperCase()}
                </Text>

                <Text style={{
                  fontSize: moderateScale(14),
                  color: theme.colors.text.primary,
                  marginBottom: verticalScale(8),
                }}>
                  {rejection.rejectionReason}
                </Text>

                {rejection.specificIssues && rejection.specificIssues.length > 0 && (
                  <View>
                    {rejection.specificIssues.map((issue, i) => (
                      <Text
                        key={i}
                        style={{
                          fontSize: moderateScale(13),
                          color: theme.colors.text.secondary,
                          marginLeft: scale(8),
                        }}
                      >
                        • {issue}
                      </Text>
                    ))}
                  </View>
                )}

                <Text style={{
                  fontSize: moderateScale(12),
                  color: theme.colors.text.secondary,
                  marginTop: verticalScale(8),
                }}>
                  Rejected by: {rejection.rejectedByName}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
    </View>
  );
}
