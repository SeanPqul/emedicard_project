import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { AdminRole } from "../users/roles";

/**
 * Check-in attendee via QR code scan
 * Inspector scans user's QR code when they arrive
 */
export const checkIn = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Verify admin/inspector role
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Only inspectors can check in attendees");
    }

    // Get orientation record
    const orientation = await ctx.db
      .query("orientations")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();

    if (!orientation) {
      throw new Error("No orientation scheduled for this application");
    }

    // Check if already checked in
    if (orientation.checkInTime) {
      return {
        success: false,
        message: "Already checked in",
        checkInTime: orientation.checkInTime,
      };
    }

    // Check if orientation status is Scheduled
    if (orientation.orientationStatus !== "Scheduled") {
      throw new Error(`Cannot check in. Orientation status is: ${orientation.orientationStatus}`);
    }

    // Perform check-in
    const checkInTime = Date.now();
    await ctx.db.patch(orientation._id, {
      checkInTime,
    });

    // Get application and user for notification
    const application = await ctx.db.get(args.applicationId);
    if (application) {
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: args.applicationId,
        title: "Orientation Check-In Successful",
        message: "You have been checked in for the food safety orientation. Please complete the session to check out.",
        notificationType: "Orientation",
        isRead: false,
      });
    }

    return {
      success: true,
      message: "Check-in successful",
      checkInTime,
    };
  },
});

/**
 * Check-out attendee via QR code scan
 * Inspector scans user's QR code when orientation is finished
 */
export const checkOut = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Verify admin/inspector role
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Only inspectors can check out attendees");
    }

    // Get orientation record
    const orientation = await ctx.db
      .query("orientations")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();

    if (!orientation) {
      throw new Error("No orientation scheduled for this application");
    }

    // Check if already checked out
    if (orientation.checkOutTime) {
      return {
        success: false,
        message: "Already checked out",
        checkOutTime: orientation.checkOutTime,
      };
    }

    // Check if checked in first
    if (!orientation.checkInTime) {
      throw new Error("Cannot check out without checking in first");
    }

    // Perform check-out
    const checkOutTime = Date.now();
    await ctx.db.patch(orientation._id, {
      checkOutTime,
      orientationStatus: "Completed",
    });

    // Update application and mark orientation as completed
    const application = await ctx.db.get(args.applicationId);
    if (application) {
      // Check if all documents are verified
      const documents = await ctx.db
        .query("documentUploads")
        .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
        .collect();
      
      const allDocumentsVerified = documents.length > 0 && documents.every(doc => doc.reviewStatus === "Verified");
      
      // Only progress to "Under Review" if documents are verified
      // Otherwise keep current status but mark orientation as complete
      const newStatus = allDocumentsVerified ? "Under Review" : application.applicationStatus;
      
      await ctx.db.patch(args.applicationId, {
        applicationStatus: newStatus,
        orientationCompleted: true,
      });

      // Send appropriate notification based on status
      const message = allDocumentsVerified 
        ? "You have successfully completed your food safety orientation. Your application will now be reviewed."
        : "You have successfully completed your food safety orientation. Please ensure all documents are submitted and verified.";
      
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: args.applicationId,
        title: "Orientation Completed!",
        message,
        notificationType: "Orientation",
        isRead: false,
      });
    }

    return {
      success: true,
      message: "Check-out successful. Orientation completed!",
      checkOutTime,
    };
  },
});

/**
 * Get attendance status for an application
 */
export const getAttendanceStatus = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const orientation = await ctx.db
      .query("orientations")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();

    if (!orientation) {
      return {
        hasOrientation: false,
        status: "Not Scheduled",
      };
    }

    return {
      hasOrientation: true,
      status: orientation.orientationStatus,
      checkInTime: orientation.checkInTime,
      checkOutTime: orientation.checkOutTime,
      isCheckedIn: !!orientation.checkInTime,
      isCheckedOut: !!orientation.checkOutTime,
      isCompleted: orientation.orientationStatus === "Completed",
    };
  },
});

/**
 * Get all attendees for a specific date/time/venue (for inspector view)
 */
export const getAttendeesForSession = query({
  args: {
    orientationDate: v.float64(),
    timeSlot: v.string(),
    orientationVenue: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify admin/inspector role
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Unauthorized");
    }

    // Get all orientations for this session
    const orientations = await ctx.db
      .query("orientations")
      .withIndex("by_date_timeslot_venue", (q) =>
        q.eq("orientationDate", args.orientationDate)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("timeSlot"), args.timeSlot),
          q.eq(q.field("orientationVenue"), args.orientationVenue)
        )
      )
      .collect();

    // Get application and user details for each orientation
    const attendees = await Promise.all(
      orientations.map(async (orientation) => {
        const application = await ctx.db.get(orientation.applicationId);
        if (!application) return null;

        const user = await ctx.db.get(application.userId);
        if (!user) return null;

        return {
          applicationId: orientation.applicationId,
          fullname: user.fullname,
          orientationStatus: orientation.orientationStatus,
          checkInTime: orientation.checkInTime,
          checkOutTime: orientation.checkOutTime,
          qrCodeUrl: orientation.qrCodeUrl,
        };
      })
    );

    return attendees.filter((a) => a !== null);
  },
});
