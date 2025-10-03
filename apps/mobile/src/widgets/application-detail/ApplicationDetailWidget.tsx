import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ApplicationDetails, PaymentMethod } from '@entities/application';
import { moderateScale } from '@shared/utils/responsive';
import { styles } from './ApplicationDetailWidget.styles';
import { theme } from '@shared/styles/theme';

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
        
        {application.status === 'Pending Payment' ? (
          <View style={styles.documentsStatusContainer}>
            <Ionicons name="alert-circle-outline" size={moderateScale(24)} color={theme.colors.accent.warningOrange} />
            <Text style={styles.documentsStatusText}>
              Documents will be verified after payment is confirmed
            </Text>
          </View>
        ) : application.status === 'Submitted' ? (
          <View style={styles.documentsStatusContainer}>
            <Ionicons name="time-outline" size={moderateScale(24)} color={theme.colors.primary[500]} />
            <Text style={styles.documentsStatusText}>
              Your documents are waiting for verification
            </Text>
          </View>
        ) : application.status === 'Under Review' ? (
          <View style={styles.documentsStatusContainer}>
            <Ionicons name="eye-outline" size={moderateScale(24)} color={theme.colors.accent.medicalBlue} />
            <Text style={styles.documentsStatusText}>
              Your documents are currently being verified
            </Text>
          </View>
        ) : application.status === 'Approved' ? (
          <View style={styles.documentsStatusContainer}>
            <Ionicons name="checkmark-circle" size={moderateScale(24)} color={theme.colors.accent.safetyGreen} />
            <Text style={[styles.documentsStatusText, { color: theme.colors.accent.safetyGreen }]}>
              All documents have been verified and approved
            </Text>
          </View>
        ) : application.status === 'Rejected' ? (
          <View style={styles.documentsStatusContainer}>
            <Ionicons name="close-circle" size={moderateScale(24)} color={theme.colors.semantic.error} />
            <Text style={[styles.documentsStatusText, { color: theme.colors.semantic.error }]}>
              Document verification failed. Please check remarks for details.
            </Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={styles.viewDocumentsButton}
          onPress={() => router.push(`/(screens)/(shared)/documents/view-document?formId=${application._id}`)}
        >
          <Ionicons name="document-text-outline" size={moderateScale(20)} color={theme.colors.primary[500]} />
          <Text style={styles.viewDocumentsText}>View Uploaded Documents</Text>
          <Ionicons name="chevron-forward" size={moderateScale(20)} color={theme.colors.primary[500]} />
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
          
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={styles.paymentMethodCard}
              onPress={() => onPaymentMethodSelect('Maya')}
              disabled={isPaymentProcessing}
            >
              <Ionicons name="card-outline" size={moderateScale(24)} color={theme.colors.primary[500]} />
              <Text style={styles.paymentMethodName}>Maya</Text>
              <Text style={styles.paymentMethodDesc}>Pay instantly</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentMethodCard}
              onPress={() => onPaymentMethodSelect('Gcash')}
              disabled={isPaymentProcessing}
            >
              <Ionicons name="phone-portrait-outline" size={moderateScale(24)} color={theme.colors.accent.primaryGreen} />
              <Text style={styles.paymentMethodName}>GCash</Text>
              <Text style={styles.paymentMethodDesc}>Coming soon</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentMethodCard}
              onPress={() => onPaymentMethodSelect('BaranggayHall')}
              disabled={isPaymentProcessing}
            >
              <Ionicons name="business-outline" size={moderateScale(24)} color={theme.colors.accent.warningOrange} />
              <Text style={styles.paymentMethodName}>Barangay Hall</Text>
              <Text style={styles.paymentMethodDesc}>Pay in person</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentMethodCard}
              onPress={() => onPaymentMethodSelect('CityHall')}
              disabled={isPaymentProcessing}
            >
              <Ionicons name="library-outline" size={moderateScale(24)} color={theme.colors.accent.safetyGreen} />
              <Text style={styles.paymentMethodName}>City Hall</Text>
              <Text style={styles.paymentMethodDesc}>Pay in person</Text>
            </TouchableOpacity>
          </View>

          {isPaymentProcessing && (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>Processing payment...</Text>
            </View>
          )}
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
            <Text style={[styles.detailValue, { color: theme.colors.accent.safetyGreen }]}>
              {application.payment.status}
            </Text>
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
