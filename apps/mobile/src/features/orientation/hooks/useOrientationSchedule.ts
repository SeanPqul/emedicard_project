import { useState } from 'react';
import { Alert } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import type { Id } from '@backend/convex/_generated/dataModel';
import type { OrientationSchedule } from '../model/types';

/**
 * Custom hook for managing orientation scheduling
 * 
 * Handles:
 * - Fetching available schedules
 * - Getting user's booked session
 * - Booking new slots
 * - Canceling bookings
 * - Loading and error states
 */
export function useOrientationSchedule(applicationId: Id<"applications"> | undefined) {
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Mutations
  const bookSlotMutation = useMutation(api.orientationSchedules.bookOrientationSlotMutation);
  const cancelBookingMutation = useMutation(api.orientationSchedules.cancelOrientationBookingMutation);

  // Fetch available schedules using Convex query
  const schedules = useQuery(
    api.orientationSchedules.getAvailableSchedulesQuery,
    {}
  );

  // Fetch user's booked session if application ID is provided
  const bookedSession = useQuery(
    api.orientationSchedules.getUserOrientationSessionQuery,
    applicationId ? { applicationId } : "skip"
  );

  // Transform schedules to match our type
  const availableSchedules: OrientationSchedule[] = (schedules || []).map(schedule => ({
    _id: schedule._id,
    date: new Date(schedule.date).toISOString(),
    time: schedule.time,
    venue: schedule.venue,
    availableSlots: schedule.availableSlots,
    totalSlots: schedule.totalSlots,
    isAvailable: schedule.isAvailable,
    instructor: schedule.instructor,
    notes: schedule.notes,
  }));

  // Transform booked session
  const transformedSession = bookedSession ? {
    _id: bookedSession._id,
    scheduleId: bookedSession.scheduleId,
    scheduledDate: new Date(bookedSession.scheduledDate).toISOString(),
    venue: bookedSession.venue,
    status: bookedSession.status,
  } : null;

  /**
   * Book an orientation slot
   */
  const bookSlot = async (scheduleId: Id<"orientationSchedules">) => {
    if (!applicationId) {
      setError('Application ID is required');
      return { success: false, error: 'Application ID is required' };
    }

    setIsBooking(true);
    setError(null);

    try {
      const result = await bookSlotMutation({ applicationId, scheduleId });
      
      Alert.alert(
        'Booking Confirmed! 🎉',
        'Your orientation session has been booked successfully. You will receive a confirmation notification.',
        [{ text: 'OK' }]
      );

      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to book orientation slot';
      setError(errorMessage);
      
      Alert.alert(
        'Booking Failed',
        errorMessage,
        [{ text: 'OK' }]
      );

      return { success: false, error: errorMessage };
    } finally {
      setIsBooking(false);
    }
  };

  /**
   * Cancel an orientation booking
   */
  const cancelBooking = async (sessionId: Id<"orientationSessions">) => {
    setIsCancelling(true);
    setError(null);

    try {
      await cancelBookingMutation({ sessionId });
      
      Alert.alert(
        'Booking Cancelled',
        'Your orientation booking has been cancelled successfully. You can book another slot.',
        [{ text: 'OK' }]
      );

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking';
      setError(errorMessage);
      
      Alert.alert(
        'Cancellation Failed',
        errorMessage,
        [{ text: 'OK' }]
      );

      return { success: false, error: errorMessage };
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    // Data
    schedules: availableSchedules,
    bookedSession: transformedSession,
    
    // Loading states
    isLoading: schedules === undefined,
    isBooking,
    isCancelling,
    
    // Error
    error,
    
    // Actions
    bookSlot,
    cancelBooking,
    clearError: () => setError(null),
  };
}
