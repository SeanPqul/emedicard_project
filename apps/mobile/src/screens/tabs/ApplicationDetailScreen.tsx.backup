import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/src/shared/navigation/types';
import { BaseScreen } from '@/src/shared/components/core';
import { useApplicationDetail } from '@features/application/hooks';
import { ApplicationDetailWidget } from '@/src/widgets/application-detail';
import { theme } from '@shared/styles/theme';

/**
 * ApplicationDetailScreen - Thin orchestrator following FSD pattern
 * 
 * This screen only handles:
 * - Loading states
 * - Error boundaries  
 * - Delegating to ApplicationDetailWidget
 * 
 * Following the same pattern as DashboardScreen
 */
interface ApplicationDetailScreenProps {
  navigation: NavigationProp<RootStackParamList, '(screens)/(application)/[id]'>;
  route: RouteProp<RootStackParamList, '(screens)/(application)/[id]'>;
}

export function ApplicationDetailScreen({ navigation, route }: ApplicationDetailScreenProps) {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Use the custom hook for all business logic
  const {
    application,
    refreshing,
    isLoading,
    isPaymentProcessing,
    isPaymentStatusProcessing,
    rejectedDocumentsCount,
    onRefresh,
    handlePaymentMethodSelect,
    getStatusIcon,
    getUrgencyColor,
  } = useApplicationDetail(id);

  // Handle loading state
  if (isLoading) {
    return (
      <BaseScreen>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.secondary} />
          <Text style={styles.loadingText}>
            Loading application details...
          </Text>
        </View>
      </BaseScreen>
    );
  }

  // Handle error state
  if (!application) {
    return (
      <BaseScreen>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            Application not found
          </Text>
        </View>
      </BaseScreen>
    );
  }

  // Delegate rendering to widget
  return (
    <BaseScreen safeArea={false}>
      <ApplicationDetailWidget
        application={application}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onPaymentMethodSelect={handlePaymentMethodSelect}
        isPaymentProcessing={isPaymentProcessing}
        isPaymentStatusProcessing={isPaymentStatusProcessing}
        getStatusIcon={getStatusIcon}
        getUrgencyColor={getUrgencyColor}
        rejectedDocumentsCount={rejectedDocumentsCount}
      />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.text.secondary,
  },
  errorText: {
    color: theme.colors.text.secondary,
  },
});
