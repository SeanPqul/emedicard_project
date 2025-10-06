import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useQuery } from 'convex/react';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { useMayaPayment } from '@processes/mayaPaymentFlow';
import { useAbandonedPayment } from '@processes/abandonedPaymentFlow';
import { ApplicationDetails, PaymentMethod } from '@entities/application';
import { theme } from '@shared/styles/theme';

export function useApplicationDetail(applicationId: string | undefined) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState('');

  const { initiatePayment, isProcessing: isPaymentProcessing } = useMayaPayment();

  // Query application details
  const application = useQuery(
    api.applications.getApplicationById.getApplicationByIdQuery,
    applicationId ? { applicationId: applicationId as Id<"applications"> } : "skip"
  ) as ApplicationDetails | undefined;
  
  // Query rejected documents count
  const rejectionHistory = useQuery(
    api.documents.rejectionQueries.getRejectionHistory,
    applicationId ? { applicationId: applicationId as Id<"applications"> } : "skip"
  );
  
  const rejectedDocumentsCount = rejectionHistory?.filter(r => !r.wasReplaced).length || 0;

  // Handle abandoned payments
  const {
    isProcessing: isPaymentStatusProcessing,
    paymentStatus,
    cancelPayment,
    checkAndHandleAbandoned,
  } = useAbandonedPayment({
    applicationId: applicationId as Id<"applications"> | null,
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
      case 'Documents Need Revision':
        return 'alert-circle';
      case 'Approved':
        return 'checkmark-circle';
      case 'Rejected':
        return 'close-circle';
      default:
        return 'document';
    }
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

  return {
    // Data
    application,
    refreshing,
    selectedPaymentMethod,
    paymentReference,
    rejectedDocumentsCount,
    
    // Loading states
    isLoading: !application && applicationId !== undefined,
    isPaymentProcessing,
    isPaymentStatusProcessing,
    
    // Handlers
    onRefresh,
    handlePaymentMethodSelect,
    setPaymentReference,
    
    // Utilities
    getStatusIcon,
    getUrgencyColor,
    
    // Payment flow
    paymentStatus,
    cancelPayment,
  };
}
