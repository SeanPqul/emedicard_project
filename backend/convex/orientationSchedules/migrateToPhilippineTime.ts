import { mutation } from "../_generated/server";
import { getPhilippineTimeComponents, APP_TIMEZONE_OFFSET_HOURS } from "../lib/timezone";

/**
 * Get start of day in Philippine Time
 */
function getStartOfPHTDay(timestamp: number): number {
  const phtComponents = getPhilippineTimeComponents(timestamp);
  
  // Create UTC midnight for that PHT date
  const midnightUTC = Date.UTC(
    phtComponents.year,
    phtComponents.month,
    phtComponents.day,
    0, 0, 0, 0
  );
  
  // Subtract 8 hours to get the UTC timestamp that represents midnight PHT
  return midnightUTC - (APP_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);
}

/**
 * Migration: Convert orientation schedule dates from UTC midnight to PHT midnight
 * 
 * This fixes schedules that were created with UTC midnight timestamps
 * to use Philippine Time midnight timestamps instead.
 * 
 * Run once: npx convex run orientationSchedules/migrateToPhilippineTime:migrateToPhilippineTime
 */
export const migrateToPhilippineTime = mutation({
  args: {},
  handler: async (ctx) => {
    const schedules = await ctx.db
      .query("orientationSchedules")
      .collect();
    
    if (schedules.length === 0) {
      return {
        success: true,
        message: "No schedules to migrate",
        migrated: 0,
      };
    }
    
    let migrated = 0;
    const results = [];
    
    for (const schedule of schedules) {
      // Convert the old date to PHT start of day
      const oldDate = schedule.date;
      const newDate = getStartOfPHTDay(oldDate);
      
      // Only update if the date changed
      if (oldDate !== newDate) {
        await ctx.db.patch(schedule._id, {
          date: newDate,
          updatedAt: Date.now(),
        });
        
        migrated++;
        results.push({
          id: schedule._id,
          oldDate: oldDate,
          oldDateISO: new Date(oldDate).toISOString(),
          newDate: newDate,
          newDateISO: new Date(newDate).toISOString(),
          time: schedule.time,
          venue: schedule.venue.name,
        });
      }
    }
    
    return {
      success: true,
      message: `Migrated ${migrated} schedules to Philippine Time`,
      total: schedules.length,
      migrated,
      skipped: schedules.length - migrated,
      results: results.slice(0, 10), // Show first 10
    };
  },
});
