import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Cancel a user's orientation booking
 * Restores the slot back to the schedule
 *
 * UPDATED: Uses unified orientationBookings table
 */
export const cancelOrientationBookingMutation = mutation({
  args: {
    bookingId: v.id("orientationBookings"),
    // Legacy support
    sessionId: v.optional(v.id("orientationBookings")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: User must be authenticated");
    }

    // Support both bookingId and sessionId (legacy)
    const id = args.bookingId || args.sessionId;
    if (!id) {
      throw new Error("Booking ID is required");
    }

    // Get the booking
    const booking = await ctx.db.get(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify the booking belongs to the user
    if (booking.userId !== identity.subject) {
      throw new Error("Unauthorized: Booking does not belong to user");
    }

    // Only allow canceling scheduled bookings
    if (booking.status !== "scheduled") {
      throw new Error(`Cannot cancel a ${booking.status} booking`);
    }

    // Get the schedule to restore the slot
    const schedule = await ctx.db.get(booking.scheduleId);
    if (schedule) {
      // Restore the slot
      await ctx.db.patch(booking.scheduleId, {
        availableSlots: schedule.availableSlots + 1,
        isAvailable: true, // Re-enable if it was disabled due to no slots
        updatedAt: Date.now(),
      });
    }

    // Update booking status to cancelled
    await ctx.db.patch(id, {
      status: "cancelled",
      cancellationReason: "User cancelled booking",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Booking cancelled successfully"
    };
  },
});

// Alias for backward compatibility
export const cancelOrientationBooking = cancelOrientationBookingMutation;
