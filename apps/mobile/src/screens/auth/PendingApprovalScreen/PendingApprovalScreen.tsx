import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { BaseScreen } from '@shared/components/core';
import { CustomButton } from '@shared/components';
import { useUsers } from '@features/profile/hooks/useUsers';
import { useToast } from '@shared/components/feedback';
import { styles } from './PendingApprovalScreen.styles';

export function PendingApprovalScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { showToast } = useToast();
  const { data: { currentUser }, isLoading, mutations: { updateUser } } = useUsers();

  const isApproved = currentUser?.registrationStatus === 'approved';
  const isRejected = currentUser?.registrationStatus === 'rejected';

  const handleCheckStatus = () => {
    if (isLoading) return;

    if (isApproved) {
      showToast("Account approved! Redirecting...", "success");
      router.replace('/(tabs)');
    }
  };

  const handleRetry = async () => {
    try {
      // Reset status to allow navigation back to upload screen
      // Sending empty string acts as a reset signal (status becomes "" which falls to 'else' case in layout)
      await updateUser({ registrationStatus: "" }); 
      // The layout will automatically redirect to upload-documents when it sees status is not approved/pending/rejected
    } catch (error) {
      showToast("Failed to reset status", "error");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      showToast("Failed to sign out", "error");
    }
  };

  return (
    <BaseScreen>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={isApproved ? "checkmark-circle-outline" : isRejected ? "close-circle-outline" : "hourglass-outline"} 
              size={80} 
              color={isApproved ? "#10B981" : isRejected ? "#EF4444" : "#F59E0B"} 
            />
            {!isApproved && !isRejected && (
              <View style={styles.badge}>
                <Ionicons name="time" size={20} color="#FFF" />
              </View>
            )}
          </View>
          
          <Text style={styles.title}>
            {isApproved ? "Account Approved!" : isRejected ? "Registration Rejected" : "Account Under Review"}
          </Text>
          <Text style={styles.subtitle}>
            {isApproved 
              ? "Your documents have been verified. You can now access the application." 
              : isRejected
              ? "Your document was rejected. Please review the requirements and try again."
              : "Your registration has been received. We are currently verifying your documents."
            }
          </Text>
          
          {!isApproved && !isRejected && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                This usually takes 24-48 hours. You can close this app and check back later.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {isApproved && (
            <CustomButton
              title="Continue to Dashboard"
              onPress={handleCheckStatus}
              loading={isLoading}
              buttonStyle={styles.button}
              variant="primary"
            />
          )}
          {isRejected && (
            <CustomButton
              title="Upload New Document"
              onPress={handleRetry}
              loading={isLoading}
              buttonStyle={styles.button}
              variant="primary" // or a warning variant if you have one
            />
          )}
           <CustomButton
            title="Sign Out"
            variant="outline"
            onPress={handleSignOut}
            buttonStyle={styles.signOutButton}
          />
        </View>
      </View>
    </BaseScreen>
  );
}