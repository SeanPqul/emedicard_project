import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { calculateSessionBounds } from "../lib/timezone";

/**
 * Book an orientation slot for a user's application
 * Validates availability and updates slot count atomically
 *
 * UPDATED: Uses unified orientationBookings table
 */
export const bookOrientationSlotMutation = mutation({
  args: {
    applicationId: v.id("applications"),
    scheduleId: v.id("orientationSchedules"),
  },
  handler: async (ctx, { applicationId, scheduleId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: User must be authenticated");
    }

    // Verify the application belongs to the user
    const application = await ctx.db.get(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || application.userId !== user._id) {
      throw new Error("Unauthorized: Application does not belong to user");
    }

    // Check if user already has an active (scheduled) booking for this application
    const existingBooking = await ctx.db
      .query("orientationBookings")
      .withIndex("by_application", (q) =>
        q.eq("applicationId", applicationId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("status"), "scheduled")
        )
      )
      .first();

    if (existingBooking) {
      throw new Error("You already have an orientation session booked for this application");
    }

    // Get the schedule and validate availability
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) {
      throw new Error("Schedule not found");
    }

    if (!schedule.isAvailable) {
      throw new Error("This schedule is no longer available");
    }

    if (schedule.availableSlots <= 0) {
      throw new Error("No available slots for this schedule");
    }

    // Check if session has already started or passed
    const now = Date.now();
    if (schedule.startMinutes !== undefined) {
      const { sessionStart } = calculateSessionBounds(
        schedule.date,
        schedule.startMinutes,
        schedule.endMinutes || 0
      );
      
      if (now >= sessionStart) {
        throw new Error("Cannot book sessions that have already started");
      }
    } else {
      // Fallback: check date only if no time specified
      if (schedule.date < now) {
        throw new Error("Cannot book past schedules");
      }
    }

    // Generate QR code data for attendance tracking
    const qrCodeData = `EMC-ORIENTATION-${applicationId}`;

    // Create the unified booking record
    const bookingId = await ctx.db.insert("orientationBookings", {
      // User & Application
      userId: identity.subject,
      applicationId,

      // Schedule Reference
      scheduleId,

      // Booking Details (denormalized for historical accuracy)
      scheduledDate: schedule.date,
      scheduledTime: schedule.time,
      venue: {
        name: schedule.venue.name,
        address: schedule.venue.address,
      },
      instructor: schedule.instructor,

      // Status
      status: "scheduled",

      // QR Code
      qrCodeUrl: qrCodeData,

      // Timestamps
      createdAt: Date.now(),
    });

    // Update application status to "Scheduled" when orientation is booked
    await ctx.db.patch(applicationId, {
      applicationStatus: "Scheduled",
      updatedAt: Date.now(),
    });

    // Send notification to user
    await ctx.db.insert("notifications", {
      userId: application.userId,
      applicationId,
      title: "Orientation Scheduled",
      message: `Your food safety orientation has been scheduled for ${new Date(schedule.date).toLocaleDateString()} at ${schedule.time}. Venue: ${schedule.venue.name}`,
      notificationType: "Orientation",
      isRead: false,
    });

    // Update available slots atomically
    const newAvailableSlots = schedule.availableSlots - 1;
    await ctx.db.patch(scheduleId, {
      availableSlots: newAvailableSlots,
      isAvailable: newAvailableSlots > 0,
      updatedAt: Date.now(),
    });

    // Get the created booking to return
    const createdBooking = await ctx.db.get(bookingId);

    return {
      success: true,
      bookingId,
      booking: createdBooking,
      // Legacy aliases for backward compatibility
      sessionId: bookingId,
      session: createdBooking,
    };
  },
});

// Alias for backward compatibility
export const bookOrientationSlot = bookOrientationSlotMutation;
