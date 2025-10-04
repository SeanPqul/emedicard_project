import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseScreen } from '@/src/shared/components/core';
import { useProfile } from '@/src/features/profile/hooks/useProfile';
import { ProfileWidget } from '@/src/widgets/profile';

/**
 * ProfileScreen - Thin orchestrator following FSD pattern
 * 
 * This screen only handles:
 * - Loading states
 * - Delegating to ProfileWidget
 * 
 * All business logic is handled by useProfile hook
 * All UI rendering is handled by ProfileWidget
 */
export function ProfileScreen() {
  const { isLoading, user } = useProfile();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <BaseScreen safeArea={false}>
      <ProfileWidget user={user} />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
