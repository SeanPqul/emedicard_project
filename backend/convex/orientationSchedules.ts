// Barrel Export File for Orientation Schedules
// This file re-exports all orientation schedule functions so they can be imported as:
// api.orientationSchedules.getSchedulesForDate instead of api.orientationSchedules.getSchedulesForDate.getSchedulesForDate
//
// The folder was renamed from "orientationSchedules/" to "_orientationSchedules/" to avoid path conflicts
// Convex cannot have both a file and folder with the same name

// Queries
export { getSchedulesForDate } from "./_orientationSchedules/getSchedulesForDate";
export { getAllSchedules, getScheduleById, getSchedulesByDateRange, getUpcomingSchedules } from "./_orientationSchedules/queries";

// Mutations
export { createSchedule, updateSchedule, deleteSchedule, bulkCreateSchedules, toggleAvailability } from "./_orientationSchedules/mutations";

// Booking operations
export { bookOrientationSlot, bookOrientationSlotMutation } from "./_orientationSchedules/bookOrientationSlot";
export { cancelOrientationBooking, cancelOrientationBookingMutation } from "./_orientationSchedules/cancelOrientationBooking";

// User session queries
export { getUserOrientationSession, getUserOrientationSessionQuery } from "./_orientationSchedules/getUserOrientationSession";

// Available schedules
export { getAvailableSchedules, getAvailableSchedulesQuery } from "./_orientationSchedules/getAvailableSchedules";
