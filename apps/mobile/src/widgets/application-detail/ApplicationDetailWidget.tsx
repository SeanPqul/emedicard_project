import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ApplicationDetails, PaymentMethod } from '@entities/application';
import { moderateScale } from '@shared/utils/responsive';
import { styles } from './ApplicationDetailWidget.styles';
import { theme } from '@shared/styles/theme';
import MayaLogo from '@/assets/svgs/maya-logo-brandlogos.net_gpvn1r359.svg';
import GCashLogo from '@/assets/svgs/gcash-logo-brandlogos.net_arv9ck6s2.svg';

// UI constants for status colors
const STATUS_COLORS = {
  'Pending Payment': '#FFA500',
  'Submitted': '#2E86AB',
  'Under Review': '#F18F01',
  'Approved': '#28A745',
  'Rejected': '#DC3545',
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
}: ApplicationDetailWidgetProps) {
  const statusColor = STATUS_COLORS[application.status as keyof typeof STATUS_COLORS];
  
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/application')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Application Details</Text>
          <View style={styles.headerRight} />
        </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons name={getStatusIcon(application.status) as any} size={moderateScale(20)} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {application.status}
            </Text>
          </View>
          <Text style={styles.applicationId}>#{application._id.slice(-8)}</Text>
        </View>
        
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

      {/* Application Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Application Information</Text>
        
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
          <Text style={styles.detailLabel}>Position</Text>
          <Text style={styles.detailValue}>{application.form?.position}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Organization</Text>
          <Text style={styles.detailValue}>{application.form?.organization}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Civil Status</Text>
          <Text style={styles.detailValue}>{application.form?.civilStatus}</Text>
        </View>

        {application.jobCategory?.requireOrientation === 'Yes' && (
          <View style={styles.orientationNotice}>
            <Ionicons name="school-outline" size={moderateScale(16)} color={theme.colors.accent.warningOrange} />
            <Text style={styles.orientationText}>
              Orientation required for this job category
            </Text>
          </View>
        )}
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
            {rejectedDocumentsCount > 0 && (
              <Text style={[styles.documentsStatusText, { color: theme.colors.semantic.error }]}>
                {rejectedDocumentsCount} document{rejectedDocumentsCount !== 1 ? 's' : ''} need revision
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={moderateScale(20)} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Payment Section - Only show if pending payment */}
      {application.status === 'Pending Payment' && (
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment Required</Text>
          
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
              <MayaLogo width={moderateScale(50)} height={moderateScale(38)} />
              <Text style={styles.paymentMethodName}>Maya</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentMethodCard, styles.paymentMethodCardDisabled]}
              onPress={() => onPaymentMethodSelect('Gcash')}
              disabled={true}
              activeOpacity={0.7}
            >
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>SOON</Text>
              </View>
              <GCashLogo width={moderateScale(50)} height={moderateScale(38)} />
              <Text style={styles.paymentMethodName}>GCash</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentMethodCard, isPaymentProcessing && styles.paymentMethodCardDisabled]}
              onPress={() => onPaymentMethodSelect('BaranggayHall')}
              disabled={isPaymentProcessing}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodIconContainer}>
                <Ionicons name="business-outline" size={moderateScale(24)} color={theme.colors.accent.warningOrange} />
              </View>
              <Text style={styles.paymentMethodName}>Barangay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentMethodCard, isPaymentProcessing && styles.paymentMethodCardDisabled]}
              onPress={() => onPaymentMethodSelect('CityHall')}
              disabled={isPaymentProcessing}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodIconContainer}>
                <Ionicons name="home-outline" size={moderateScale(24)} color={theme.colors.accent.safetyGreen} />
              </View>
              <Text style={styles.paymentMethodName}>City Hall</Text>
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
              After selecting a payment method, you'll be redirected to complete the payment process.
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
            <Text style={styles.detailValue}>₱{application.payment.amount}</Text>
          </View>

          {application.payment.referenceNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reference Number</Text>
              <Text style={styles.detailValue}>{application.payment.referenceNumber}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status</Text>
            <View style={[styles.paymentStatusBadge, { backgroundColor: theme.colors.accent.safetyGreen + '20' }]}>
              <Text style={[styles.paymentStatusText, { color: theme.colors.accent.safetyGreen }]}>
                {application.payment.status}
              </Text>
            </View>
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
    </View>
  );
}
