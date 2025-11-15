import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * CONVEX SCHEDULED JOBS (CRON JOBS)
 * 
 * This file registers all scheduled functions that run automatically.
 */

const crons = cronJobs();

/**
 * AUTO-CREATE WEEKLY ORIENTATION SCHEDULES
 * 
 * Runs: Every Sunday at 11:00 PM UTC
 * Purpose: Creates orientation schedules for the next week (Monday-Friday)
 * 
 * Schedule Configuration:
 * - Creates 2 time slots per day (morning and afternoon)
 * - Monday through Friday only
 * - Uses default venue and capacity settings
 * - Skips dates that already have schedules
 * 
 * To customize the schedule settings, edit:
 * backend/convex/_orientationSchedules/autoCreateSchedulesHandler.ts
 */
crons.weekly(
  "auto-create-weekly-orientation-schedules",
  { 
    hourUTC: 23,      // 11 PM UTC (adjust to your timezone)
    minuteUTC: 0,     // At minute 0
    dayOfWeek: "sunday" as const  // Every Sunday
  },
  // @ts-ignore - Deep type instantiation limitation
  internal._orientationSchedules.autoCreateSchedulesHandler.createNextWeekSchedules
);

/**
 * AUTO-CANCEL EXPIRED PENDING PAYMENT APPLICATIONS
 * 
 * Runs: Daily at 12:00 AM UTC (8:00 AM Philippine Time)
 * Purpose: Cancels applications that haven't been paid within 7 days
 * 
 * Business Rules:
 * - Applications in "Pending Payment" status
 * - Payment deadline has passed (7 days from submission)
 * - User receives notification about cancellation
 * - Cancelled applications remain in history for reference
 */
crons.daily(
  "auto-cancel-expired-applications",
  {
    hourUTC: 0,       // 12:00 AM UTC = 8:00 AM Philippine Time
    minuteUTC: 0,
  },
  // @ts-ignore - Deep type instantiation limitation
  internal.applications.autoCancelExpiredApplications.cancelExpiredApplications
);

/**
 * To add more scheduled jobs, use:
 * 
 * Daily job:
 * crons.daily("job-name", { hourUTC: 0, minuteUTC: 0 }, internal.module.function);
 * 
 * Hourly job:
 * crons.hourly("job-name", { minuteUTC: 0 }, internal.module.function);
 * 
 * Monthly job:
 * crons.monthly("job-name", { hourUTC: 0, minuteUTC: 0, day: 1 }, internal.module.function);
 * 
 * Custom interval:
 * crons.interval("job-name", { minutes: 30 }, internal.module.function);
 */

export default crons;
