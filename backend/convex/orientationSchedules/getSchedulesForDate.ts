import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all orientation schedules for a specific date with attendee counts
 * This shows ALL schedules (even with 0 attendees) so inspectors can see the full schedule
 */
export const getSchedulesForDate = query({
  args: {
    selectedDate: v.number(), // Timestamp of selected date (start of day)
  },
  handler: async (ctx, args) => {
    // Get all orientation schedules for the selected date
    const schedules = await ctx.db
      .query("orientationSchedules")
      .withIndex("by_date", (q) => q.eq("date", args.selectedDate))
      .collect();

    // For each schedule, get the booked sessions and attendee details
    const schedulesWithAttendees = await Promise.all(
      schedules.map(async (schedule) => {
        // Get all orientation sessions (bookings) for this schedule
        const sessions = await ctx.db
          .query("orientationSessions")
          .withIndex("by_schedule", (q) => q.eq("scheduleId", schedule._id))
          .collect();

        // Get attendee details for each session
        const attendees = await Promise.all(
          sessions.map(async (session) => {
            const application = await ctx.db.get(session.applicationId);
            if (!application) return null;

            const user = await ctx.db.get(application.userId);
            if (!user) return null;

            const jobCategory = await ctx.db.get(application.jobCategoryId);

            return {
              sessionId: session._id,
              applicationId: session.applicationId,
              fullname: user.fullname,
              jobCategory: jobCategory?.name || "Unknown",
              jobCategoryColor: jobCategory?.colorCode || "#gray",
              applicationStatus: application.applicationStatus,
              sessionStatus: session.status,
              scheduledDate: session.scheduledDate,
            };
          })
        );

        const validAttendees = attendees.filter((a) => a !== null);

        return {
          scheduleId: schedule._id,
          date: schedule.date,
          time: schedule.time,
          venue: schedule.venue,
          instructor: schedule.instructor,
          notes: schedule.notes,
          totalSlots: schedule.totalSlots,
          availableSlots: schedule.availableSlots,
          isAvailable: schedule.isAvailable,
          attendees: validAttendees,
          attendeeCount: validAttendees.length,
          bookedSlots: sessions.length,
        };
      })
    );

    return schedulesWithAttendees;
  },
});
