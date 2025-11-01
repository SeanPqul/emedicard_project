import { api } from '@backend/convex/_generated/api';
import { ConvexClient } from 'convex/browser';
import type { Id } from '@backend/convex/_generated/dataModel';
import type { OrientationSchedule, OrientationSession } from '../model/types';

/**
 * Orientation Service
 * 
 * Handles all orientation scheduling-related API operations
 * with proper error handling and type safety.
 */
export class OrientationService {
  constructor(private convexClient: ConvexClient) {}

  /**
   * Get all available orientation schedules
   * Returns only future schedules with available slots
   */
  async getAvailableSchedules(): Promise<OrientationSchedule[]> {
    try {
      const schedules = await this.convexClient.query(
        api.orientationSchedules.getAvailableSchedulesQuery,
        {}
      );
      
      return schedules.map(schedule => ({
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
    } catch (error) {
      console.error('Error fetching available schedules:', error);
      throw new OrientationServiceError(
        'Failed to fetch available schedules',
        'FETCH_SCHEDULES_ERROR',
        error
      );
    }
  }

  /**
   * Get user's orientation session for a specific application
   */
  async getUserSession(applicationId: Id<"applications">): Promise<OrientationSession | null> {
    try {
      const session = await this.convexClient.query(
        api.orientationSchedules.getUserOrientationSessionQuery,
        { applicationId }
      );
      
      if (!session) return null;

      return {
        _id: session._id,
        userId: session.userId,
        applicationId: session.applicationId,
        scheduledDate: new Date(session.scheduledDate).toISOString(),
        completedDate: session.completedDate 
          ? new Date(session.completedDate).toISOString()
          : undefined,
        status: session.status,
        venue: session.venue,
        instructor: session.instructor,
        certificateId: session.certificateId,
        notes: session.notes,
      };
    } catch (error) {
      console.error('Error fetching user session:', error);
      throw new OrientationServiceError(
        'Failed to fetch user session',
        'FETCH_SESSION_ERROR',
        error
      );
    }
  }

  /**
   * Book an orientation slot
   */
  async bookSlot(
    applicationId: Id<"applications">,
    scheduleId: Id<"orientationSchedules">
  ): Promise<{ success: boolean; bookingId: Id<"orientationBookings">; booking: any }> {
    try {
      const result = await this.convexClient.mutation(
        api.orientationSchedules.bookOrientationSlotMutation,
        { applicationId, scheduleId }
      );
      
      return result;
    } catch (error) {
      console.error('Error booking orientation slot:', error);
      
      // Extract user-friendly error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to book orientation slot';
      
      throw new OrientationServiceError(
        errorMessage,
        'BOOK_SLOT_ERROR',
        error
      );
    }
  }

  /**
   * Cancel an orientation booking
   */
  async cancelBooking(bookingId: Id<"orientationBookings">): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.convexClient.mutation(
        api.orientationSchedules.cancelOrientationBookingMutation,
        { bookingId }
      );
      
      return result;
    } catch (error) {
      console.error('Error canceling booking:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to cancel booking';
      
      throw new OrientationServiceError(
        errorMessage,
        'CANCEL_BOOKING_ERROR',
        error
      );
    }
  }
}

/**
 * Custom error class for orientation service errors
 */
export class OrientationServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'OrientationServiceError';
  }
}
