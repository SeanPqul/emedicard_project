import { internalMutation } from "../_generated/server";
import { parseTimeRange, formatTimeRange, calculateDuration } from "./timeUtils";

/**
 * Migrate existing orientation schedules to use structured time fields
 * Parses existing time strings and populates startMinutes/endMinutes/durationMinutes
 * 
 * Run this once after deploying the new schema:
 * npx convex run orientationSchedules:migrateExistingSchedules
 */
export const migrateExistingSchedules = internalMutation({
  args: {},
  handler: async (ctx) => {
    const schedules = await ctx.db.query("orientationSchedules").collect();
    
    let migratedCount = 0;
    let skippedCount = 0;
    const errors: Array<{ scheduleId: string; error: string; time: string }> = [];

    for (const schedule of schedules) {
      // Skip if already migrated
      if (schedule.startMinutes !== undefined && schedule.endMinutes !== undefined) {
        skippedCount++;
        continue;
      }

      try {
        // Parse the existing time string
        const { startMinutes, endMinutes } = parseTimeRange(schedule.time);
        const durationMinutes = calculateDuration(startMinutes, endMinutes);

        // Regenerate the time string in standard format
        const standardizedTime = formatTimeRange(startMinutes, endMinutes);

        // Update the schedule
        await ctx.db.patch(schedule._id, {
          startMinutes,
          endMinutes,
          durationMinutes,
          time: standardizedTime, // Standardize format
          updatedAt: Date.now(),
        });

        migratedCount++;
      } catch (error) {
        // Log error but continue with other schedules
        errors.push({
          scheduleId: schedule._id,
          error: error instanceof Error ? error.message : String(error),
          time: schedule.time,
        });
      }
    }

    return {
      success: errors.length === 0,
      totalSchedules: schedules.length,
      migratedCount,
      skippedCount,
      errorCount: errors.length,
      errors,
    };
  },
});

/**
 * Dry run migration to preview what would be changed without making changes
 * Safe to run anytime to check migration status
 */
export const dryRunMigration = internalMutation({
  args: {},
  handler: async (ctx) => {
    const schedules = await ctx.db.query("orientationSchedules").collect();
    
    const preview: Array<{
      scheduleId: string;
      currentTime: string;
      needsMigration: boolean;
      parsed?: { startMinutes: number; endMinutes: number; newTime: string; durationMinutes: number };
      error?: string;
    }> = [];
    
    for (const schedule of schedules) {
      const needsMigration = schedule.startMinutes === undefined || schedule.endMinutes === undefined;
      
      if (!needsMigration) {
        preview.push({
          scheduleId: schedule._id,
          currentTime: schedule.time,
          needsMigration: false,
        });
        continue;
      }
      
      try {
        const { startMinutes, endMinutes } = parseTimeRange(schedule.time);
        const durationMinutes = calculateDuration(startMinutes, endMinutes);
        const newTime = formatTimeRange(startMinutes, endMinutes);
        
        preview.push({
          scheduleId: schedule._id,
          currentTime: schedule.time,
          needsMigration: true,
          parsed: {
            startMinutes,
            endMinutes,
            newTime,
            durationMinutes,
          },
        });
      } catch (error) {
        preview.push({
          scheduleId: schedule._id,
          currentTime: schedule.time,
          needsMigration: true,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    
    const needsMigration = preview.filter(p => p.needsMigration).length;
    const alreadyMigrated = preview.filter(p => !p.needsMigration).length;
    const hasErrors = preview.filter(p => p.error).length;
    
    return {
      success: true,
      totalSchedules: schedules.length,
      needsMigration,
      alreadyMigrated,
      hasErrors,
      preview,
    };
  },
});
