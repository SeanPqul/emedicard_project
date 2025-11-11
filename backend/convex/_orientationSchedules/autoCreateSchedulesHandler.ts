import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { formatTimeRange, calculateDuration, validateTimeRange } from "./timeUtils";

/**
 * DEFAULT SCHEDULE CONFIGURATION
 * Customize these values based on your organization's needs
 * 
 * @updated 2025-11-10 - Configured for Davao City office (primary application venue)
 */
const DEFAULT_CONFIG = {
  // Time slots for each weekday (using structured time: minutes since midnight)
  timeSlots: [
    { startMinutes: 540, endMinutes: 660 }, // 9:00 AM - 11:00 AM
    { startMinutes: 840, endMinutes: 960 }, // 2:00 PM - 4:00 PM
  ],
  
  // Venue information - Davao City Office
  venue: {
    name: "Magsaysay Complex - Door 7",
    address: "Door 7, Magsaysay Complex, Magsaysay Park, Davao City",
    capacity: 50, // Room's maximum safe capacity
  },
  
  // Slots configuration - Conservative limit for comfortable spacing
  totalSlots: 30,
  
  // Instructor information (optional - used if no inspector assigned)
  instructor: {
    name: "Health Inspector",
    designation: "Health Inspector",
  },
  
  // Default notes
  notes: "Please bring valid ID and application reference number. Arrive 15 minutes early.",
  
  // Auto-assign inspectors (set to false to use default instructor)
  autoAssignInspectors: true, // Set to true to enable round-robin inspector assignment
};

/**
 * Shared logic for creating schedules
 * This function contains the actual implementation
 */
async function createSchedulesLogic(ctx: any) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  // Calculate next Monday
  const today = new Date(now);
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Days until next Monday
  const daysUntilNextMonday = currentDayOfWeek === 0 ? 1 : 8 - currentDayOfWeek;
  const nextMonday = new Date(now + (daysUntilNextMonday * oneDay));
  nextMonday.setHours(0, 0, 0, 0);
  
  // Get available inspectors if auto-assignment is enabled
  let availableInspectors: any[] = [];
  let inspectorIndex = 0;
  
  if (DEFAULT_CONFIG.autoAssignInspectors) {
    availableInspectors = await ctx.db
      .query("users")
      .withIndex("by_role", (q: any) => q.eq("role", "inspector"))
      .collect();
  }
  
  const createdSchedules = [];
  const skippedSchedules = [];
  
  // Create schedules for Monday to Friday
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const scheduleDate = new Date(nextMonday.getTime() + (dayOffset * oneDay));
    const dateTimestamp = scheduleDate.getTime();
    
    // Create schedules for each time slot
    for (const timeSlot of DEFAULT_CONFIG.timeSlots) {
      const { startMinutes, endMinutes } = timeSlot;
      
      // Validate time range
      validateTimeRange(startMinutes, endMinutes);
      
      // Generate display string and duration
      const time = formatTimeRange(startMinutes, endMinutes);
      const durationMinutes = calculateDuration(startMinutes, endMinutes);
      
      // Check if schedule already exists for this date and time
      const schedulesOnDate = await ctx.db
        .query("orientationSchedules")
        .withIndex("by_date")
        .collect();
      
      const existingSchedule = schedulesOnDate.find(
        (s: { date: number; startMinutes?: number; endMinutes?: number }) => 
          s.date === dateTimestamp && 
          s.startMinutes === startMinutes && 
          s.endMinutes === endMinutes
      );
      
      if (existingSchedule) {
        skippedSchedules.push({
          date: scheduleDate.toDateString(),
          time,
          reason: "Already exists",
        });
        continue;
      }
      
      // Determine instructor info
      // If auto-assign is enabled and inspectors are available, use round-robin
      // Otherwise, use default instructor from config
      let instructorInfo = DEFAULT_CONFIG.instructor;
      
      if (DEFAULT_CONFIG.autoAssignInspectors && availableInspectors.length > 0) {
        // Round-robin assignment
        const assignedInspector = availableInspectors[inspectorIndex % availableInspectors.length];
        inspectorIndex++;
        
        instructorInfo = {
          name: assignedInspector.fullname,
          designation: "Health Inspector",
        };
      }
      
      // Create new schedule
      const scheduleId = await ctx.db.insert("orientationSchedules", {
        date: dateTimestamp,
        startMinutes,
        endMinutes,
        time,
        durationMinutes,
        venue: DEFAULT_CONFIG.venue,
        availableSlots: DEFAULT_CONFIG.totalSlots,
        totalSlots: DEFAULT_CONFIG.totalSlots,
        isAvailable: true,
        instructor: instructorInfo,
        notes: DEFAULT_CONFIG.notes,
        createdAt: now,
        updatedAt: now,
      });
      
      createdSchedules.push({
        id: scheduleId,
        date: scheduleDate.toDateString(),
        time,
      });
    }
  }
  
  return {
    success: true,
    created: createdSchedules.length,
    skipped: skippedSchedules.length,
    createdSchedules,
    skippedSchedules,
    weekStartDate: nextMonday.toDateString(),
  };
}

/**
 * Internal mutation called by cron job
 * Creates orientation schedules for the next week (Monday-Friday)
 */
export const createNextWeekSchedules = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await createSchedulesLogic(ctx);
  },
});

/**
 * Manual trigger function for testing
 * Run this from Convex dashboard to test the auto-creation
 */
export const testAutoCreate = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await createSchedulesLogic(ctx);
  },
});

/**
 * Configuration updater (for future use)
 * Allows updating default configuration without code changes
 */
export const updateDefaultConfig = internalMutation({
  args: {
    timeSlots: v.optional(v.array(v.object({
      startMinutes: v.float64(),
      endMinutes: v.float64(),
    }))),
    venueName: v.optional(v.string()),
    venueAddress: v.optional(v.string()),
    venueCapacity: v.optional(v.float64()),
    totalSlots: v.optional(v.float64()),
    instructorName: v.optional(v.string()),
    instructorDesignation: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Store configuration in a settings table
    // For now, we'll just return the config
    // You can implement persistent storage later if needed
    
    return {
      success: true,
      message: "Configuration update noted. Please update the DEFAULT_CONFIG in code.",
      newConfig: args,
    };
  },
});
