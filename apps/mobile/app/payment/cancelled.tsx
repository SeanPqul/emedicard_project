import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/src/shared/components';
import { FeedbackSystem } from '@/src/shared/components/feedback/feedback';

/**
 * Payment Cancelled Screen
 * Handles Maya payment cancellation deep link returns
 * Route: emedicardproject://payment/cancelled?paymentId=xxx&applicationId=xxx
 */
export default function PaymentCancelledScreen() {
  const { paymentId, applicationId } = useLocalSearchParams<{
    paymentId?: string;
    applicationId?: string;
  }>();
  const router = useRouter();

  useEffect(() => {
    console.log('💨 Payment cancelled by user:', { paymentId, applicationId });
  }, [paymentId, applicationId]);

  const handleTryAgain = () => {
    if (applicationId) {
      // Return to application details to retry payment
      router.push(`/(screens)/(shared)/application-details?applicationId=${applicationId}`);
    } else {
      // Return to applications list
      router.push('/(tabs)/applications');
    }
  };

  const handleGoToApplications = () => {
    router.push('/(tabs)/applications');
  };

  const handleGoToDashboard = () => {
    router.push('/(tabs)/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.cancelIcon}>⚪</Text>
        <Text style={styles.title}>Payment Cancelled</Text>
        <Text style={styles.subtitle}>
          You cancelled the ₱60 health card payment
        </Text>
        <Text style={styles.description}>
          No charges have been made to your account. You can try the payment again whenever you're ready.
        </Text>
        {paymentId && (
          <Text style={styles.details}>
            Payment ID: {paymentId}
          </Text>
        )}
        <View style={styles.buttonContainer}>
          <Button
            title="Try Payment Again"
            onPress={handleTryAgain}
            style={[styles.button, styles.primaryButton]}
          />
          <Button
            title="Go to Applications"
            onPress={handleGoToApplications}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="Back to Dashboard"
            onPress={handleGoToDashboard}
            variant="outline"
            style={styles.button}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 Your application is saved and waiting for payment. Complete the payment to proceed with your health card processing.
          </Text>
        </View>
      </View>
      <FeedbackSystem />
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
  cancelIcon: {
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
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
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
  infoContainer: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
});