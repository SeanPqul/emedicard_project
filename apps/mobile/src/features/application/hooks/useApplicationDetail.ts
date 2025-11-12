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
  const applicationRaw = useQuery(
    api.applications.getApplicationById.getApplicationByIdQuery,
    applicationId ? { applicationId: applicationId as Id<"applications"> } : "skip"
  ) as ApplicationDetails | undefined;

  // Always fetch the latest payment separately to avoid stale data if there are retries
  const latestPayment = useQuery(
    api.payments.getPaymentByFormId.getPaymentByApplicationIdQuery,
    applicationId ? { applicationId: applicationId as Id<"applications"> } : "skip"
  ) as any;

  // Merge latest payment into application object (map Convex doc -> UI shape)
  const application = React.useMemo(() => {
    if (!applicationRaw) return applicationRaw;
    if (!latestPayment) return applicationRaw;

    const mappedPayment = {
      _id: latestPayment._id,
      amount: latestPayment.amount,
      netAmount: latestPayment.netAmount,
      serviceFee: latestPayment.serviceFee,
      method: latestPayment.paymentMethod,
      location: latestPayment.paymentLocation,
      status: latestPayment.paymentStatus,
      referenceNumber: latestPayment.referenceNumber,
    };

    return { ...applicationRaw, payment: mappedPayment } as ApplicationDetails;
  }, [applicationRaw, latestPayment]);
  
  // Phase 4 Migration: Query both old rejections and new referrals
  const rejectionHistory = useQuery(
    api.documents.rejectionQueries.getRejectionHistory,
    applicationId ? { applicationId: applicationId as Id<"applications"> } : "skip"
  );

  const referralHistory = useQuery(
    api.documents.referralQueries?.getReferralHistory,
    applicationId ? { applicationId: applicationId as Id<"applications"> } : "skip"
  );
  
  // Combine counts from both sources
  const oldRejectedCount = rejectionHistory?.filter(r => !r.wasReplaced).length || 0;
  const newReferralCount = referralHistory?.filter((r: any) => !r.wasReplaced).length || 0;
  const rejectedDocumentsCount = oldRejectedCount + newReferralCount;

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
      case 'For Payment Validation':
        return 'alert-circle';
      case 'For Orientation':
        return 'school-outline';
      case 'Submitted':
        return 'document-text';
      case 'Under Review':
        return 'eye';
      case 'Approved':
        return 'checkmark-circle';
      case 'Rejected': // DEPRECATED - backward compatibility
        return 'close-circle';
      // Phase 4 Migration: New statuses
      case 'Referred for Medical Management':
        return 'medkit-outline';
      case 'Documents Need Revision':
        return 'document-text-outline';
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
    } else if (method === 'BaranggayHall' || method === 'CityHall') {
      // Navigate to manual payment upload screen
      if (!application) {
        Alert.alert('Error', 'Application not found');
        return;
      }
      const { router } = require('expo-router');
      router.push({
        pathname: '/(screens)/(shared)/manual-payment',
        params: {
          applicationId: application._id,
          paymentMethod: method,
        },
      });
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
