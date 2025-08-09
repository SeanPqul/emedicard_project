import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/src/styles/theme';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { useRoleBasedNavigation } from '@/src/hooks/useRoleBasedNavigation';
import { useRouter } from 'expo-router';

export default function ReviewApplications() {
  const userProfile = useQuery(api["users/getCurrent"].getCurrentUser);
  const { canAccessScreen } = useRoleBasedNavigation(userProfile?.role);
  const router = useRouter();

  React.useEffect(() => {
    if (userProfile && !canAccessScreen('reviewApplications')) {
      router.replace('/(tabs)');
    }
  }, [userProfile, canAccessScreen, router]);

  if (!userProfile) {
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

  if (userProfile.role !== 'inspector') {
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unauthorizedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.semantic.error,
  },
});
