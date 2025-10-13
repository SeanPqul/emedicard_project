import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BaseScreen } from '@shared/components/core';
import { OrientationScheduler } from '@features/orientation';
import { MOCK_ORIENTATION_SCHEDULES } from '@features/orientation/mocks/orientationSchedules.mock';
import { theme } from '@shared/styles/theme';
import { moderateScale, verticalScale, scale } from '@shared/utils/responsive';

/**
 * OrientationScheduleScreen
 * 
 * Dedicated screen for scheduling orientation sessions.
 * Follows the same pattern as ViewDocumentScreen for consistency.
 */
export function OrientationScheduleScreen() {
  const { applicationId } = useLocalSearchParams<{ applicationId: string }>();

  const handleScheduleSelect = (schedule: any) => {
    console.log('Selected schedule:', schedule);
    // TODO: Implement booking logic once backend is ready
    // For now, just show success and navigate back
    alert(`Orientation booked for ${schedule.date}!\n\nYou will receive a confirmation notification.`);
    
    // Navigate back to application detail
    router.back();
  };

  const handleCancelBooking = () => {
    console.log('Cancel booking for application:', applicationId);
    // TODO: Implement cancel logic once backend is ready
    alert('Booking cancelled successfully');
    router.back();
  };

  return (
    <BaseScreen safeArea={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule Orientation</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Scheduler */}
        <OrientationScheduler
          schedules={MOCK_ORIENTATION_SCHEDULES}
          isLoading={false}
          onScheduleSelect={handleScheduleSelect}
          bookedSession={null}
          onCancelBooking={handleCancelBooking}
        />
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  headerSpacer: {
    width: moderateScale(40),
  },
});
