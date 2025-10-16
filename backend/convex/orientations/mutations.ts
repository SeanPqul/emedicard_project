import { v } from "convex/values";
import { mutation } from "../_generated/server";

const SLOT_CAPACITY = 10; // Max 10 applicants per slot

export const schedule = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // 1. Check for an existing orientation for this application
    const existingOrientation = await ctx.db
      .query("orientations")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .first();

    if (existingOrientation) {
      throw new Error("This applicant is already scheduled for an orientation.");
    }

    // 2. Create the new orientation record with QR code for attendance tracking
    const qrCodeData = `EMC-ORIENTATION-${args.applicationId}`;
    const orientationId = await ctx.db.insert("orientations", {
      applicationId: args.applicationId,
      orientationStatus: "Scheduled",
      scheduledAt: Date.now(),
      qrCodeUrl: qrCodeData,
    });

    // 3. Update the application status
    await ctx.db.patch(args.applicationId, {
      applicationStatus: "Scheduled",
    });

    // 4. Create a notification for the applicant
    const application = await ctx.db.get(args.applicationId);
    if (application) {
        await ctx.db.insert("notifications", {
            userId: application.userId,
            applicationId: args.applicationId,
            title: "Orientation Scheduled!",
            message: `Your orientation has been scheduled. Please check your application details.`,
            notificationType: "OrientationScheduled",
            isRead: false,
        });
    }

    return { success: true, orientationId };
  },
});
