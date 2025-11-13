import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale, fontScale } from '@shared/utils/responsive';
import { Button } from '../../../../src/shared/components';

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
      router.replace(`/(screens)/(application)/${applicationId}`);
    } else {
      // Return to applications list
      router.replace('/(tabs)/application');
    }
  };

  const handleGoToApplications = () => {
    router.replace('/(tabs)/application');
  };

  const handleGoToDashboard = () => {
    router.replace('/(tabs)/');
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
      {/* FeedbackSystem removed - should be managed at app level */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  cancelIcon: {
    fontSize: moderateScale(72),
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: fontScale(22),
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  subtitle: {
    fontSize: fontScale(14),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(12),
  },
  description: {
    fontSize: fontScale(13),
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(16),
    paddingHorizontal: scale(12),
  },
  details: {
    fontSize: fontScale(12),
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: verticalScale(24),
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: scale(12),
    marginBottom: verticalScale(16),
  },
  button: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: theme.colors.brand.primary,
  },
  infoContainer: {
    backgroundColor: theme.colors.orange[50],
    padding: scale(16),
    borderRadius: moderateScale(12),
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.orange[200],
  },
  infoText: {
    fontSize: fontScale(13),
    color: theme.colors.orange[800],
    textAlign: 'center',
    lineHeight: moderateScale(18),
  },
});
