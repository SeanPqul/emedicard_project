import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Id } from '@backend/convex/_generated/dataModel';
import { BaseScreen } from '@shared/components/core';
import { OrientationScheduler, useOrientationSchedule } from '@features/orientation';
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

  // Use the orientation scheduling hook with real backend
  const {
    schedules,
    bookedSession,
    isLoading,
    isBooking,
    isCancelling,
    bookSlot,
    cancelBooking,
  } = useOrientationSchedule(applicationId as Id<"applications"> | undefined);

  const handleScheduleSelect = async (schedule: any) => {
    const result = await bookSlot(schedule._id);
    
    if (result.success) {
      // Navigate back to application detail after successful booking
      router.back();
    }
  };

  const handleCancelBooking = async () => {
    if (!bookedSession) return;
    
    const result = await cancelBooking(bookedSession._id);
    
    if (result.success) {
      router.back();
    }
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
          schedules={schedules}
          isLoading={isLoading || isBooking}
          onScheduleSelect={handleScheduleSelect}
          bookedSession={bookedSession}
          onCancelBooking={handleCancelBooking}
          isCancelling={isCancelling}
          applicationId={applicationId}
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
