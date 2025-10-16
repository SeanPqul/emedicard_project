import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Cancel a user's orientation booking
 * Restores the slot back to the schedule
 */
export const cancelOrientationBookingMutation = mutation({
  args: { 
    sessionId: v.id("orientationSessions") 
  },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: User must be authenticated");
    }

    // Get the session
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Verify the session belongs to the user
    if (session.userId !== identity.subject) {
      throw new Error("Unauthorized: Session does not belong to user");
    }

    // Only allow canceling scheduled sessions
    if (session.status !== "scheduled") {
      throw new Error(`Cannot cancel a ${session.status} session`);
    }

    // Get the schedule to restore the slot
    const schedule = await ctx.db.get(session.scheduleId);
    if (schedule) {
      // Restore the slot
      await ctx.db.patch(session.scheduleId, {
        availableSlots: schedule.availableSlots + 1,
        isAvailable: true, // Re-enable if it was disabled due to no slots
        updatedAt: Date.now(),
      });
    }

    // Update session status to cancelled
    await ctx.db.patch(sessionId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    // Also delete the orientation record (with QR code) if it exists
    const orientation = await ctx.db
      .query("orientations")
      .withIndex("by_application", (q) => q.eq("applicationId", session.applicationId))
      .unique();
    
    if (orientation) {
      await ctx.db.delete(orientation._id);
    }

    return { 
      success: true,
      message: "Booking cancelled successfully" 
    };
  },
});

// Alias for backward compatibility
export const cancelOrientationBooking = cancelOrientationBookingMutation;
