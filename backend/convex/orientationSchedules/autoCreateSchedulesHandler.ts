import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * DEFAULT SCHEDULE CONFIGURATION
 * Customize these values based on your organization's needs
 */
const DEFAULT_CONFIG = {
  // Time slots for each weekday
  timeSlots: [
    "9:00 AM - 11:00 AM",
    "2:00 PM - 4:00 PM",
  ],
  
  // Venue information
  venue: {
    name: "City Health Office",
    address: "123 Health St., Downtown, Metro Manila",
    capacity: 30,
  },
  
  // Slots configuration
  totalSlots: 25,
  
  // Instructor information (optional)
  instructor: {
    name: "Dr. Maria Santos",
    designation: "Health Inspector",
  },
  
  // Default notes
  notes: "Please bring valid ID and application reference number. Arrive 15 minutes early.",
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
  
  console.log(`Creating schedules starting from: ${nextMonday.toDateString()}`);
  
  const schedulesToCreate = [];
  const createdSchedules = [];
  const skippedSchedules = [];
  
  // Create schedules for Monday to Friday
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const scheduleDate = new Date(nextMonday.getTime() + (dayOffset * oneDay));
    const dateTimestamp = scheduleDate.getTime();
    
    // Create schedules for each time slot
    for (const timeSlot of DEFAULT_CONFIG.timeSlots) {
      // Check if schedule already exists for this date and time
      const schedulesOnDate = await ctx.db
        .query("orientationSchedules")
        .withIndex("by_date")
        .collect();
      
      const existingSchedule = schedulesOnDate.find(
        (s: { date: number; time: string }) => s.date === dateTimestamp && s.time === timeSlot
      );
      
      if (existingSchedule) {
        skippedSchedules.push({
          date: scheduleDate.toDateString(),
          time: timeSlot,
          reason: "Already exists",
        });
        continue;
      }
      
      // Create new schedule
      const scheduleId = await ctx.db.insert("orientationSchedules", {
        date: dateTimestamp,
        time: timeSlot,
        venue: DEFAULT_CONFIG.venue,
        availableSlots: DEFAULT_CONFIG.totalSlots,
        totalSlots: DEFAULT_CONFIG.totalSlots,
        isAvailable: true,
        instructor: DEFAULT_CONFIG.instructor,
        notes: DEFAULT_CONFIG.notes,
        createdAt: now,
        updatedAt: now,
      });
      
      createdSchedules.push({
        id: scheduleId,
        date: scheduleDate.toDateString(),
        time: timeSlot,
      });
      
      schedulesToCreate.push({
        date: scheduleDate.toDateString(),
        time: timeSlot,
      });
    }
  }
  
  // Log the results
  console.log(`✅ Created ${createdSchedules.length} new schedules`);
  console.log(`⏭️  Skipped ${skippedSchedules.length} existing schedules`);
  
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
    console.log("🧪 Testing automatic schedule creation...");
    return await createSchedulesLogic(ctx);
  },
});

/**
 * Configuration updater (for future use)
 * Allows updating default configuration without code changes
 */
export const updateDefaultConfig = internalMutation({
  args: {
    timeSlots: v.optional(v.array(v.string())),
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
