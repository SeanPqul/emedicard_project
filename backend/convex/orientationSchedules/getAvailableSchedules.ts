import { query } from "../_generated/server";
import { calculateSessionBounds, isSessionPast, getPhilippineTimeComponents } from "../lib/timezone";

/**
 * Get all available orientation schedules
 * Returns only future schedules that have available slots
 * Uses timezone-aware session end time calculation
 * Returns PHT-formatted display strings for consistent client rendering
 */
export const getAvailableSchedulesQuery = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Get all schedules that are:
    // 1. Available (isAvailable = true)
    // 2. Have slots available
    const allSchedules = await ctx.db
      .query("orientationSchedules")
      .withIndex("by_availability", (q) => 
        q.eq("isAvailable", true)
      )
      .filter((q) => q.gt(q.field("availableSlots"), 0))
      .collect();

    // Filter out schedules where the session has already started
    // Users cannot book sessions that are currently in progress or have ended
    const activeSchedules = allSchedules.filter(schedule => {
      if (!schedule.startMinutes) return true; // Keep if no start time defined
      
      const { sessionStart } = calculateSessionBounds(
        schedule.date,
        schedule.startMinutes,
        schedule.endMinutes || 0
      );
      
      // Only show sessions that haven't started yet
      return now < sessionStart;
    });

    // Sort by date, then by start time
    const sortedSchedules = activeSchedules.sort((a, b) => {
      if (a.date === b.date) {
        return (a.startMinutes || 0) - (b.startMinutes || 0);
      }
      return a.date - b.date;
    });

    // Add PHT-formatted display fields for client consumption
    const schedulesWithDisplayData = sortedSchedules.map(schedule => {
      const phtComponents = getPhilippineTimeComponents(schedule.date);
      
      return {
        ...schedule,
        // PHT-specific display fields
        displayDate: {
          year: phtComponents.year,
          month: phtComponents.month + 1, // Convert back to 1-indexed
          day: phtComponents.day,
          weekday: new Intl.DateTimeFormat('en-US', { 
            timeZone: 'Asia/Manila', 
            weekday: 'long' 
          }).format(schedule.date),
          monthName: new Intl.DateTimeFormat('en-US', { 
            timeZone: 'Asia/Manila', 
            month: 'short' 
          }).format(schedule.date),
        }
      };
    });

    // Return up to 20 schedules
    return schedulesWithDisplayData.slice(0, 20);
  },
});

// Alias for backward compatibility
export const getAvailableSchedules = getAvailableSchedulesQuery;
