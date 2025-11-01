/**
 * OrientationSchedules Module
 *
 * Exports all schedule management and booking functions
 */

// Schedule CRUD operations
export {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  bulkCreateSchedules,
  toggleAvailability,
} from "./mutations";

export {
  getAllSchedules,
  getScheduleById,
  getSchedulesByDateRange,
  getUpcomingSchedules,
} from "./queries";

// Booking operations
export {
  bookOrientationSlot,
  bookOrientationSlotMutation,
} from "./bookOrientationSlot";

export {
  cancelOrientationBooking,
  cancelOrientationBookingMutation,
} from "./cancelOrientationBooking";

// User session queries
export {
  getUserOrientationSession,
  getUserOrientationSessionQuery,
} from "./getUserOrientationSession";

// Available schedules for applicants
export {
  getAvailableSchedules,
  getAvailableSchedulesQuery,
} from "./getAvailableSchedules";

// Time utilities (if needed externally)
export * from "./timeUtils";
