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
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { BaseScreen } from '@/src/shared/components/core';
import { api } from 'backend/convex/_generated/api';
import { Id } from 'backend/convex/_generated/dataModel';
import { useMayaPayment } from '@processes/mayaPaymentFlow';
import { useAbandonedPayment } from '@processes/abandonedPaymentFlow';
import { CustomButton } from '@shared/components';

import {
  ApplicationDetailScreenProps,
  ApplicationDetails,
  PaymentMethod,
  STATUS_COLORS
} from './ApplicationDetailScreen.types';
import { styles } from './ApplicationDetailScreen.styles';
import { theme } from '@shared/styles/theme';

export function ApplicationDetailScreen({ navigation, route }: ApplicationDetailScreenProps) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState('');

  const { initiatePayment, isProcessing: isPaymentProcessing } = useMayaPayment();

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
    if (daysLeft === null) return theme.colors.text.secondary;
    if (daysLeft <= 1) return theme.colors.status.error;
    if (daysLeft <= 3) return theme.colors.status.warning;
    return theme.colors.status.success;
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
      <BaseScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.secondary} />
          <Text style={styles.loadingText}>Loading application details...</Text>
        </View>
      </BaseScreen>
    );
  }

  const statusColor = STATUS_COLORS[application.status as keyof typeof STATUS_COLORS];
  const daysUntilDeadline = getDaysUntilDeadline(application.paymentDeadline);

  return (
    <BaseScreen>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Application Details</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIconContainer, { backgroundColor: statusColor + '20' }]}>
              <Ionicons name={getStatusIcon(application.status)} size={24} color={statusColor} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusText, { color: statusColor }]}>{application.status}</Text>
              <Text style={styles.applicationId}>ID: {application._id.slice(-8)}</Text>
            </View>
          </View>

          {application.status === 'Pending Payment' && daysUntilDeadline !== null && (
            <View style={[styles.urgencyBanner, { backgroundColor: getUrgencyColor(daysUntilDeadline) + '20' }]}>
              <Text style={[styles.urgencyText, { color: getUrgencyColor(daysUntilDeadline) }]}>
                {daysUntilDeadline <= 0
                  ? 'Payment deadline expired'
                  : `${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} left to pay`}
              </Text>
            </View>
          )}

          {application.remarks && (
            <View style={styles.remarksContainer}>
              <Text style={styles.remarksLabel}>Remarks</Text>
              <Text style={styles.remarksText}>{application.remarks}</Text>
            </View>
          )}
        </View>

        {/* Application Info */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Application Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{application.form?.applicationType}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Job Category</Text>
            <View style={styles.jobCategoryBadge}>
              <View style={[styles.jobCategoryDot, { backgroundColor: application.jobCategory?.colorCode }]} />
              <Text style={styles.infoValue}>{application.jobCategory?.name}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Position</Text>
            <Text style={styles.infoValue}>{application.form?.position}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Organization</Text>
            <Text style={styles.infoValue}>{application.form?.organization}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Submitted</Text>
            <Text style={styles.infoValue}>
              {new Date(application._creationTime).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Payment Section */}
        {application.status === 'Pending Payment' && (
          <View style={styles.paymentCard}>
            <Text style={styles.sectionTitle}>Payment Required</Text>
            <Text style={styles.paymentAmount}>?60.00</Text>
            <Text style={styles.paymentBreakdown}>Application Fee: ?50.00 | Service Fee: ?10.00</Text>
            
            <View style={styles.paymentMethods}>
              <TouchableOpacity 
                style={styles.paymentMethodButton}
                onPress={() => handlePaymentMethodSelect('Maya')}
                disabled={isPaymentProcessing || isPaymentStatusProcessing}
              >
                <Text style={styles.paymentMethodText}>Pay with Maya</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.paymentMethodButton}
                onPress={() => handlePaymentMethodSelect('Gcash')}
              >
                <Text style={styles.paymentMethodText}>Pay with GCash</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.paymentMethodButton, styles.manualPaymentButton]}
                onPress={() => handlePaymentMethodSelect('BaranggayHall')}
              >
                <Text style={styles.paymentMethodText}>Pay at Barangay Hall</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.paymentMethodButton, styles.manualPaymentButton]}
                onPress={() => handlePaymentMethodSelect('CityHall')}
              >
                <Text style={styles.paymentMethodText}>Pay at City Hall</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {application.status === 'Approved' && (
            <CustomButton
              title="View Health Card"
              onPress={() => router.push('/(screens)/(shared)/health-cards')}
              variant="primary"
            />
          )}
          
          <CustomButton
            title="View Documents"
            onPress={() => router.push(`/(screens)/(shared)/(screens)/(shared)/application/${application._id}/documents`)}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </BaseScreen>
  );
}