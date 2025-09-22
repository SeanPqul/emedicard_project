import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { Button } from '../../../../src/shared/components';
import { FeedbackSystem } from '../../../../src/shared/components/feedback/feedback';

/**
 * Payment Success Screen
 * Handles Maya payment success deep link returns
 * Route: emedicardproject://payment/success?paymentId=xxx&applicationId=xxx
 */
export default function PaymentSuccessScreen() {
  const { paymentId, applicationId } = useLocalSearchParams<{
    paymentId?: string;
    applicationId?: string;
  }>();
  const router = useRouter();

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const syncPaymentStatus = useMutation(api.payments.maya.statusUpdates.syncPaymentStatus);

  useEffect(() => {
    async function verifyPayment() {
      if (!paymentId) {
        setErrorMessage('No payment ID provided');
        setVerificationResult('failed');
        setIsVerifying(false);
        return;
      }

      try {
        console.log('🔄 Verifying payment success for:', paymentId);

        // Sync payment status with Maya to confirm actual payment status
        const result = await syncPaymentStatus({
          paymentId: paymentId as Id<"payments">
        });

        if (result.status === 'Complete') {
          setVerificationResult('success');
          console.log('✅ Payment verified as successful');
        } else if (result.status === 'Failed') {
          setVerificationResult('failed');
          setErrorMessage('Payment failed during processing');
          console.log('❌ Payment verification failed');
        } else {
          // Still pending, might need more time
          setErrorMessage('Payment is still being processed. Please check back in a few minutes.');
          setVerificationResult('failed');
          console.log('⏳ Payment still pending verification');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Payment verification failed');
        setVerificationResult('failed');
      } finally {
        setIsVerifying(false);
      }
    }

    verifyPayment();
  }, [paymentId, syncPaymentStatus]);

  const handleContinue = () => {
    if (applicationId) {
      // Return to application details screen
      router.push(`/(screens)/(shared)/application-details?applicationId=${applicationId}`);
    } else {
      // Return to applications list
      router.push('/(tabs)/applications');
    }
  };

  const handleRetry = () => {
    // Go back to applications to retry payment
    router.push('/(tabs)/applications');
  };

  if (isVerifying) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.title}>Verifying Payment...</Text>
          <Text style={styles.subtitle}>
            Please wait while we confirm your payment with Maya
          </Text>
        </View>
      </View>
    );
  }

  if (verificationResult === 'success') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>
            Your ₱60 health card payment has been processed successfully
          </Text>
          <Text style={styles.details}>
            Payment ID: {paymentId}
          </Text>
          <Button
            title="Continue to Application"
            onPress={handleContinue}
            style={styles.button}
          />
        </View>
        {/* TODO: Implement feedback system with proper props 
        <FeedbackSystem messages={[]} onDismiss={() => {}} /> */}
      </View>
    );
  }

  // Verification failed
  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.errorIcon}>❌</Text>
        <Text style={styles.title}>Payment Verification Failed</Text>
        <Text style={styles.subtitle}>
          {errorMessage || 'Unable to verify payment status'}
        </Text>
        <Text style={styles.details}>
          Payment ID: {paymentId || 'Unknown'}
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Retry Payment"
            onPress={handleRetry}
            style={[styles.button, styles.primaryButton]}
          />
          <Button
            title="Go to Applications"
            onPress={handleContinue}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </View>
      {/* TODO: Implement feedback system with proper props 
      <FeedbackSystem messages={[]} onDismiss={() => {}} /> */}
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
  successIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  errorIcon: {
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
  details: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'monospace',
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
});