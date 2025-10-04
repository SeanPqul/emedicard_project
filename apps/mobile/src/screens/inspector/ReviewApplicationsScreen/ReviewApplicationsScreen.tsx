import React from 'react';
import { View, Text } from 'react-native';
import { LoadingSpinner } from '@shared/components';
import { useRoleBasedNavigation } from '@features/navigation';
import { useRouter } from 'expo-router';
import { User } from '@entities/user/model/types';
import { useUsers } from '@features/profile';
import { styles } from '@shared/styles/screens/inspector-review-applications';

export function ReviewApplicationsScreen() {
  // Use new hooks pattern
  const { data: { currentUser: userProfile }, isLoading: loading } = useUsers();
  const { canAccessScreen } = useRoleBasedNavigation(userProfile?.role);
  const router = useRouter();

  React.useEffect(() => {
    if (userProfile && !canAccessScreen('review-applications')) {
      router.replace('/(tabs)');
    }
  }, [userProfile, canAccessScreen, router]);

  if (loading) {
    return (
      <LoadingSpinner 
        visible={true} 
        message="Loading applications..." 
        fullScreen 
        type="pulse" 
        icon="clipboard" 
      />
    );
  }

  if (!userProfile || userProfile.role !== 'inspector') {
    return (
      <View style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedText}>Access Denied</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review Applications</Text>
        <Text style={styles.subtitle}>Pending applications for review</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          Application review interface will be implemented here:
          {'\n\n'}• List of pending applications
          {'\n'}• Document verification
          {'\n'}• Approve/reject functionality
          {'\n'}• Add review comments
        </Text>
      </View>
    </View>
  );
}