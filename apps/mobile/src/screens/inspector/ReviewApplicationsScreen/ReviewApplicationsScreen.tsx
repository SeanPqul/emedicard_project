import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LoadingSpinner } from '@shared/components';
import { useRoleBasedNavigation } from '@features/navigation';
import { useRouter } from 'expo-router';
import { User } from '@entities/user/model/types';
import { useUsers } from '@features/profile';
import { theme } from '@shared/styles/theme';
import { moderateScale, scale, verticalScale } from '@shared/utils/responsive';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(4),
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: scale(20),
  },
  placeholderText: {
    fontSize: moderateScale(16),
    color: theme.colors.text.secondary,
    lineHeight: moderateScale(24),
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unauthorizedText: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: theme.colors.semantic.error,
  },
});
