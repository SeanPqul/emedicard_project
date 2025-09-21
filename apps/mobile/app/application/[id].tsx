import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import { api } from '../../../../backend/convex/_generated/api';
import { Id } from '../../../../backend/convex/_generated/dataModel';
import { usePaymentMaya } from '../../src/hooks/usePaymentMaya';
import { useAbandonedPayment } from '../../src/hooks/useAbandonedPayment';
import { CustomButton } from '../../src/components';
import { styles } from '../../src/styles/screens/application-details';
import { getColor } from '../../src/styles/theme';
import { useFocusEffect } from '@react-navigation/native';

type PaymentMethod = 'Maya' | 'Gcash' | 'BaranggayHall' | 'CityHall';

interface ApplicationDetails {
  _id: string;
  _creationTime: number;
  userId: string;
  formId: string;
  status: 'Pending Payment' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  approvedAt?: number;
  remarks?: string;
  paymentDeadline?: number;
  form?: {
    _id: string;
    applicationType: 'New' | 'Renew';
    position: string;
    organization: string;
    civilStatus: string;
    jobCategory: string;
  };
  jobCategory?: {
    _id: string;
    name: string;
    colorCode: string;
    requireOrientation: string;
  };
  payment?: {
    _id: string;
    amount: number;
    method: string;
    status: string;
    referenceNumber?: string;
  };
}

const STATUS_COLORS = {
  'Pending Payment': '#FFA500',
  'Submitted': '#2E86AB',
  'Under Review': '#F18F01',
  'Approved': '#28A745',
  'Rejected': '#DC3545',
};

export default function ApplicationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState('');

  const { initiatePayment, isProcessing: isPaymentProcessing } = usePaymentMaya();

  // Query application details
  const application = useQuery(
    api.applications.getApplicationById.getApplicationByIdQuery,
    id ? { applicationId: id as Id<"applications"> } : "skip"
  ) as ApplicationDetails | undefined;

  // Handle abandoned payments
  const {
    isProcessing: isPaymentStatusProcessing,
    paymentStatus,
    cancelPayment,
    checkAndHandleAbandoned,
  } = useAbandonedPayment({
    applicationId: id as Id<"applications"> | null,
    autoCheck: true,
  });

  // Check for abandoned payments when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      // Check if there's a processing payment when user returns to this screen
      if (paymentStatus === 'Processing') {
        console.log('Detected processing payment, checking if abandoned...');
        checkAndHandleAbandoned().then(result => {
          if (result.handled) {
            Alert.alert(
              'Payment Cancelled',
              'Your previous payment was cancelled. You can try again.',
              [{ text: 'OK' }]
            );
          }
        });
      }
    }, [paymentStatus, checkAndHandleAbandoned])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // Query will auto-refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending Payment':
        return 'time-outline';
      case 'Submitted':
        return 'document-text';
      case 'Under Review':
        return 'eye';
      case 'Approved':
        return 'checkmark-circle';
      case 'Rejected':
        return 'close-circle';
      default:
        return 'document';
    }
  };

  const getDaysUntilDeadline = (deadline?: number) => {
    if (!deadline) return null;
    const now = Date.now();
    const diff = deadline - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getUrgencyColor = (daysLeft: number | null) => {
    if (daysLeft === null) return getColor('text.secondary');
    if (daysLeft <= 1) return getColor('semantic.error');
    if (daysLeft <= 3) return getColor('accent.warningOrange');
    return getColor('accent.safetyGreen');
  };

  const handlePaymentMethodSelect = async (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);

    if (method === 'Maya' && application) {
      try {
        const result = await initiatePayment(
          application._id as Id<"applications">,
          50, // Application fee
          10  // Service fee
        );

        if (result.success) {
          if (result.waitingForReturn) {
            Alert.alert(
              'Payment in Progress',
              'Please complete your payment in the Maya app. You will be redirected back here once done.',
              [{ text: 'OK' }]
            );
          }
        } else {
          Alert.alert('Payment Error', result.reason || 'Failed to initiate payment');
        }
      } catch (error) {
        console.error('Payment error:', error);
        Alert.alert('Payment Error', 'Failed to process payment. Please try again.');
      }
    } else if (method === 'Gcash') {
      // Handle GCash payment (to be implemented)
      Alert.alert('Coming Soon', 'GCash payment integration is coming soon!');
    } else if (method === 'BaranggayHall' || method === 'CityHall') {
      const referenceNumber = `MANUAL-${Date.now()}`;
      Alert.alert(
        'Manual Payment',
        `Please proceed to ${method === 'BaranggayHall' ? 'Barangay Hall' : 'City Hall'} to complete your payment.\n\nYour reference number is: ${referenceNumber}`,
        [
          {
            text: 'Copy Reference',
            onPress: () => {
              // Copy to clipboard functionality
              Alert.alert('Copied', 'Reference number copied to clipboard');
            },
          },
          { text: 'OK' },
        ]
      );
    }
  };

  if (!application) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={getColor('primary.500')} />
        <Text style={styles.loadingText}>Loading application details...</Text>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[application.status as keyof typeof STATUS_COLORS];
  const creationDate = new Date(application._creationTime).toLocaleDateString();
  const daysUntilDeadline = getDaysUntilDeadline(application.paymentDeadline);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              // Navigate to applications tab if can't go back
              router.replace('/(tabs)/application');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={getColor('text.primary')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Ionicons name={getStatusIcon(application.status)} size={20} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {application.status}
              </Text>
            </View>
            <Text style={styles.applicationId}>#{application._id.slice(-8)}</Text>
          </View>
          
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Application Date</Text>
            <Text style={styles.statusValue}>{creationDate}</Text>
          </View>

          {application.status === 'Pending Payment' && daysUntilDeadline !== null && (
            <View style={styles.deadlineContainer}>
              <Ionicons 
                name="time-outline" 
                size={16} 
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
              <Ionicons name="school-outline" size={16} color={getColor('accent.warningOrange')} />
              <Text style={styles.orientationText}>
                Orientation required for this job category
              </Text>
            </View>
          )}
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
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === 'Maya' && styles.paymentMethodCardSelected
                ]}
                onPress={() => handlePaymentMethodSelect('Maya')}
                disabled={isPaymentProcessing}
              >
                <Ionicons name="card-outline" size={24} color={getColor('primary.500')} />
                <Text style={styles.paymentMethodName}>Maya</Text>
                <Text style={styles.paymentMethodDesc}>Pay instantly</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === 'Gcash' && styles.paymentMethodCardSelected
                ]}
                onPress={() => handlePaymentMethodSelect('Gcash')}
                disabled={isPaymentProcessing}
              >
                <Ionicons name="phone-portrait-outline" size={24} color={getColor('accent.primaryGreen')} />
                <Text style={styles.paymentMethodName}>GCash</Text>
                <Text style={styles.paymentMethodDesc}>Coming soon</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === 'BaranggayHall' && styles.paymentMethodCardSelected
                ]}
                onPress={() => handlePaymentMethodSelect('BaranggayHall')}
                disabled={isPaymentProcessing}
              >
                <Ionicons name="business-outline" size={24} color={getColor('accent.warningOrange')} />
                <Text style={styles.paymentMethodName}>Barangay Hall</Text>
                <Text style={styles.paymentMethodDesc}>Pay in person</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === 'CityHall' && styles.paymentMethodCardSelected
                ]}
                onPress={() => handlePaymentMethodSelect('CityHall')}
                disabled={isPaymentProcessing}
              >
                <Ionicons name="library-outline" size={24} color={getColor('accent.safetyGreen')} />
                <Text style={styles.paymentMethodName}>City Hall</Text>
                <Text style={styles.paymentMethodDesc}>Pay in person</Text>
              </TouchableOpacity>
            </View>

            {isPaymentProcessing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color={getColor('primary.500')} />
                <Text style={styles.processingText}>Processing payment...</Text>
              </View>
            )}

            {/* Show cancel button if payment is stuck in processing */}
            {paymentStatus === 'Processing' && !isPaymentProcessing && (
              <TouchableOpacity
                style={styles.cancelPaymentButton}
                onPress={() => {
                  Alert.alert(
                    'Cancel Payment',
                    'Are you sure you want to cancel this payment?',
                    [
                      { text: 'No', style: 'cancel' },
                      {
                        text: 'Yes, Cancel',
                        style: 'destructive',
                        onPress: async () => {
                          const result = await cancelPayment();
                          if (result.success) {
                            Alert.alert('Payment Cancelled', 'You can now retry the payment.');
                          } else {
                            Alert.alert('Error', result.error || 'Failed to cancel payment');
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.cancelPaymentText}>Cancel Pending Payment</Text>
              </TouchableOpacity>
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
              <Text style={[styles.detailValue, { color: getColor('accent.safetyGreen') }]}>
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
