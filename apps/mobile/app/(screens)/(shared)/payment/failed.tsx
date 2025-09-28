import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { Button } from '../../../../src/shared/components';
import { FeedbackSystem } from '../../../../src/shared/components/feedback/feedback';

/**
 * Payment Failed Screen
 * Handles Maya payment failure deep link returns
 * Route: emedicardproject://payment/failed?paymentId=xxx&applicationId=xxx
 */
export default function PaymentFailedScreen() {
  const { paymentId, applicationId, reason } = useLocalSearchParams<{
    paymentId?: string;
    applicationId?: string;
    reason?: string;
  }>();
  const router = useRouter();

  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [actualStatus, setActualStatus] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const syncPaymentStatus = useMutation(api.payments.maya.statusUpdates.syncPaymentStatus);

  useEffect(() => {
    async function checkFinalStatus() {
      if (!paymentId) {
        setErrorDetails('No payment ID provided');
        setIsCheckingStatus(false);
        return;
      }

      try {
        console.log('?? Checking final payment status for failed payment:', paymentId);

        // Even though Maya said it failed, double-check with backend
        const result = await syncPaymentStatus({
          paymentId: paymentId as Id<"payments">
        });

        setActualStatus(result.status);

        if (result.status === 'Complete') {
          console.log('?? Payment actually succeeded despite failure redirect!');
          // This can happen due to network issues - redirect to success
          router.replace(`/payment/success?paymentId=${paymentId}&applicationId=${applicationId}`);
          return;
        } else if (result.status === 'Failed') {
          setErrorDetails(reason || 'Payment processing failed');
          console.log('? Payment confirmed as failed');
        } else {
          setErrorDetails('Payment status is unclear. Please try again.');
          console.log('?? Payment status unclear:', result.status);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setErrorDetails(error instanceof Error ? error.message : 'Unable to check payment status');
      } finally {
        setIsCheckingStatus(false);
      }
    }

    checkFinalStatus();
  }, [paymentId, applicationId, reason, syncPaymentStatus, router]);

  const handleRetryPayment = () => {
    if (applicationId) {
      // Go back to application to retry payment
      router.push(`/(screens)/(shared)/application-details?applicationId=${applicationId}`);
    } else {
      // Go to applications list
      router.push('/(tabs)/applications');
    }
  };

  const handleGoToApplications = () => {
    router.push('/(tabs)/applications');
  };

  const getFailureReason = () => {
    if (errorDetails) return errorDetails;
    if (reason) return reason;
    if (actualStatus === 'Expired') return 'Payment session expired';
    if (actualStatus === 'Cancelled') return 'Payment was cancelled';
    return 'Payment processing failed';
  };

  if (isCheckingStatus) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.title}>Checking Payment Status...</Text>
          <Text style={styles.subtitle}>
            Verifying the final status of your payment
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.failureIcon}>?</Text>
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.subtitle}>
          Your ?60 health card payment could not be processed
        </Text>
        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>Reason:</Text>
          <Text style={styles.reasonText}>{getFailureReason()}</Text>
        </View>
        {paymentId && (
          <Text style={styles.details}>
            Payment ID: {paymentId}
          </Text>
        )}
        <View style={styles.buttonContainer}>
          <Button
            title="Try Payment Again"
            onPress={handleRetryPayment}
            style={[styles.button, styles.primaryButton]}
          />
          <Button
            title="Go to Applications"
            onPress={handleGoToApplications}
            variant="secondary"
            style={styles.button}
          />
        </View>
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            ?? Make sure you have sufficient balance in your Maya account and try again
          </Text>
        </View>
      </View>
      {/* FeedbackSystem removed - should be managed at app level */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  failureIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  reasonContainer: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#FF3B30',
    lineHeight: 20,
  },
  details: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  helpContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  helpText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    lineHeight: 20,
  },
});
