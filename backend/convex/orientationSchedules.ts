// Orientation Schedules Module
// Root-level barrel export for clean API paths: api.orientationSchedules.*
// Uses explicit named exports to avoid conflicts with direct file exports

// Queries
export { getSchedulesForDate } from "./orientationSchedules/getSchedulesForDate";
export { getAllSchedules, getScheduleById, getSchedulesByDateRange, getUpcomingSchedules } from "./orientationSchedules/queries";

// Mutations
export { createSchedule, updateSchedule, deleteSchedule, bulkCreateSchedules, toggleAvailability } from "./orientationSchedules/mutations";

// Booking operations
export { bookOrientationSlot, bookOrientationSlotMutation } from "./orientationSchedules/bookOrientationSlot";
export { cancelOrientationBooking, cancelOrientationBookingMutation } from "./orientationSchedules/cancelOrientationBooking";

// User session queries
export { getUserOrientationSession, getUserOrientationSessionQuery } from "./orientationSchedules/getUserOrientationSession";

// Available schedules
export { getAvailableSchedules, getAvailableSchedulesQuery } from "./orientationSchedules/getAvailableSchedules";
