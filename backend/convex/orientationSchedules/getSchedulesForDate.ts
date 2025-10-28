import { query } from "../_generated/server";
import { v } from "convex/values";
import { getPhilippineTimeComponents } from "../lib/timezone";

/**
 * Get orientation schedules for a specific date with server-side status calculation
 * Uses server time (tamper-proof) to determine isPast, isUpcoming, isActive
 * 
 * @param selectedDate - UTC timestamp for the date (midnight in PHT)
 * @returns Schedules with attendance data and server-calculated status flags
 */
export const getSchedulesForDate = query({
  args: {
    selectedDate: v.number(), // UTC timestamp of selected date (start of day in PHT)
  },
  handler: async (ctx, args) => {
    // Get all orientation schedules for the selected date
    const schedules = await ctx.db
      .query("orientationSchedules")
      .withIndex("by_date", (q) => q.eq("date", args.selectedDate))
      .collect();

    // Get SERVER time (cannot be spoofed by client)
    const serverNow = Date.now();
    const serverPhtComponents = getPhilippineTimeComponents(serverNow);
    
    // For each schedule, get attendees and calculate status
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

        // Calculate isPast, isUpcoming, isActive using SERVER TIME
        const schedulePhtComponents = getPhilippineTimeComponents(schedule.date);
        const serverPhtMinutes = serverPhtComponents.hours * 60 + serverPhtComponents.minutes;
        
        // Check if schedule is today (in PHT)
        const isToday = 
          schedulePhtComponents.year === serverPhtComponents.year &&
          schedulePhtComponents.month === serverPhtComponents.month &&
          schedulePhtComponents.day === serverPhtComponents.day;
        
        let isPast = false;
        let isUpcoming = false;
        let isActive = false;
        
        if (schedule.startMinutes !== undefined && schedule.endMinutes !== undefined) {
          if (isToday) {
            // For today: compare current PHT time with session times
            isPast = serverPhtMinutes > schedule.endMinutes;
            isUpcoming = serverPhtMinutes < schedule.startMinutes;
            isActive = serverPhtMinutes >= schedule.startMinutes && serverPhtMinutes <= schedule.endMinutes;
          } else {
            // For other dates: compare dates
            isPast = schedule.date < serverNow;
            isUpcoming = schedule.date > serverNow;
          }
        }

        return {
          scheduleId: schedule._id,
          date: schedule.date,
          time: schedule.time,
          startMinutes: schedule.startMinutes,
          endMinutes: schedule.endMinutes,
          venue: schedule.venue,
          instructor: schedule.instructor,
          notes: schedule.notes,
          totalSlots: schedule.totalSlots,
          availableSlots: schedule.availableSlots,
          isAvailable: schedule.isAvailable,
          attendees: validAttendees,
          attendeeCount: validAttendees.length,
          bookedSlots: sessions.length,
          // Server-calculated status (tamper-proof)
          isPast,
          isUpcoming,
          isActive,
          // Include server time for client reference
          serverTime: serverNow,
        };
      })
    );

    return schedulesWithAttendees;
  },
});
