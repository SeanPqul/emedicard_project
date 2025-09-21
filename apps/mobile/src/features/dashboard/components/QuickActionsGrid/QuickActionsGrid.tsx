import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { ActionButton } from '@/src/components/ui/ActionButton';
import { QuickActionsGridProps } from '../../types';
import { styles } from './QuickActionsGrid.styles';

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  userApplications,
  dashboardStats,
  currentApplication,
}) => {
  const isNewUser = (!userApplications || userApplications.length === 0) && dashboardStats.validHealthCards === 0;
  const isFoodHandler = currentApplication?.jobCategory?.name?.toLowerCase().includes('food');
  const needsOrientation = isFoodHandler && !currentApplication?.orientationCompleted;

  const getPrimaryAction = () => {
    if (isNewUser) {
      return (
        <ActionButton
          icon="add-circle-outline"
          title="Apply for Health Card"
          subtitle="Start your first application"
          onPress={() => router.push('/(tabs)/apply')}
          isPrimary
        />
      );
    }
    
    if (dashboardStats.pendingPayments > 0) {
      return (
        <ActionButton
          icon="information-circle-outline"
          title="Application Status"
          subtitle="Track your progress"
          onPress={() => router.push('/(tabs)/application')}
          isPrimary
        />
      );
    }
    
    if (dashboardStats.validHealthCards > 0) {
      return (
        <ActionButton
          icon="qr-code-outline"
          title="Show Health Card"
          subtitle="Display your QR code"
          onPress={() => router.push('/(screens)/(shared)/qr-code')}
          isPrimary
        />
      );
    }
    
    return (
      <ActionButton
        icon="refresh-outline"
        title="Renew Health Card"
        subtitle="Start renewal process"
        onPress={() => router.push('/(tabs)/apply')}
        isPrimary
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>What would you like to do?</Text>
      <View style={styles.actionsGrid}>
        {getPrimaryAction()}
        
        <ActionButton
          icon="document-text-outline"
          title="Requirements Guide"
          subtitle="What documents you need"
          onPress={() => router.push('/(screens)/(shared)/document-requirements')}
        />
        
        {dashboardStats.activeApplications > 0 ? (
          <ActionButton
            icon="cloud-upload-outline"
            title="Upload Documents"
            subtitle="Submit missing documents"
            onPress={() => router.push('/(screens)/(shared)/upload-documents')}
          />
        ) : (
          <ActionButton
            icon="information-circle-outline"
            title="Application Status"
            subtitle="Track your progress"
            onPress={() => router.push('/(tabs)/application')}
          />
        )}

        {isFoodHandler && needsOrientation ? (
          <ActionButton
            icon="calendar-outline"
            title="Food Safety Orientation"
            subtitle="View requirements & schedule"
            onPress={() => router.push('/(screens)/(shared)/orientation')}
          />
        ) : (
          <ActionButton
            icon="help-circle-outline"
            title="Need Help?"
            subtitle="Contact support"
            onPress={() => router.push('/(tabs)/notification')}
          />
        )}
      </View>
    </View>
  );
};
