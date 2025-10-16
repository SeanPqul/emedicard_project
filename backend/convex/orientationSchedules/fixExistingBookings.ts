import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Fix existing bookings that don't have orientations records
 * This creates orientations records (with QR codes) for existing sessions
 */
export const fixExistingBookingsMutation = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all scheduled orientation sessions
    const sessions = await ctx.db
      .query("orientationSessions")
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .collect();

    let created = 0;
    let skipped = 0;

    for (const session of sessions) {
      // Check if orientation record already exists
      const existingOrientation = await ctx.db
        .query("orientations")
        .withIndex("by_application", (q) => q.eq("applicationId", session.applicationId))
        .unique();

      if (existingOrientation) {
        skipped++;
        continue;
      }

      // Get the schedule details
      const schedule = await ctx.db.get(session.scheduleId);
      if (!schedule) {
        console.warn(`Schedule ${session.scheduleId} not found for session ${session._id}`);
        continue;
      }

      // Generate QR code
      const qrCodeData = `EMC-ORIENTATION-${session.applicationId}`;

      // Create orientation record
      await ctx.db.insert("orientations", {
        applicationId: session.applicationId,
        orientationDate: session.scheduledDate,
        timeSlot: schedule.time,
        orientationVenue: session.venue.name,
        orientationStatus: "Scheduled",
        qrCodeUrl: qrCodeData,
        scheduledAt: session.createdAt,
      });

      created++;
    }

    return {
      success: true,
      created,
      skipped,
      message: `Created ${created} orientation records, skipped ${skipped} existing ones`,
    };
  },
});

// Alias for backward compatibility
export const fixExistingBookings = fixExistingBookingsMutation;
