import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Test script to simulate scanning a QR code for check-in and check-out
 * This bypasses the inspector role check for testing purposes
 */

export const simulateCheckIn = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    console.log(`[TEST] Simulating check-in for application: ${args.applicationId}`);
    
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

    console.log(`[TEST] ✓ Check-in successful at ${new Date(checkInTime).toISOString()}`);

    return {
      success: true,
      message: "Check-in successful",
      checkInTime,
    };
  },
});

export const simulateCheckOut = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    console.log(`[TEST] Simulating check-out for application: ${args.applicationId}`);
    
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
      const newStatus = allDocumentsVerified ? "Under Review" : application.applicationStatus;
      
      await ctx.db.patch(args.applicationId, {
        applicationStatus: newStatus,
        orientationCompleted: true,
      });

      console.log(`[TEST] Documents: ${documents.length} total, All verified: ${allDocumentsVerified}, Status: ${newStatus}`);

      // Send completion notification
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

    console.log(`[TEST] ✓ Check-out successful at ${new Date(checkOutTime).toISOString()}`);

    return {
      success: true,
      message: "Check-out successful. Orientation completed!",
      checkOutTime,
    };
  },
});

/**
 * Reset orientation to test again
 */
export const resetOrientation = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    console.log(`[TEST] ============================================`);
    console.log(`[TEST] Resetting orientation for application`);
    console.log(`[TEST] Application ID: ${args.applicationId}`);
    console.log(`[TEST] ============================================`);
    
    // Get orientation record
    const orientation = await ctx.db
      .query("orientations")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();

    if (!orientation) {
      throw new Error("No orientation found for this application");
    }

    // Reset orientation to Scheduled state
    await ctx.db.patch(orientation._id, {
      checkInTime: undefined,
      checkOutTime: undefined,
      orientationStatus: "Scheduled",
    });

    // Reset application orientation flag
    await ctx.db.patch(args.applicationId, {
      orientationCompleted: false,
    });

    console.log(`[TEST] ✓ Orientation reset successfully`);
    console.log(`[TEST] - Check-in time: cleared`);
    console.log(`[TEST] - Check-out time: cleared`);
    console.log(`[TEST] - Status: Scheduled`);
    console.log(`[TEST] - orientationCompleted: false`);
    console.log(`[TEST] ============================================`);

    return {
      success: true,
      message: "Orientation reset to Scheduled state",
    };
  },
});

/**
 * Combined test: Check-in, wait, then check-out
 */
export const simulateFullOrientationFlow = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    console.log(`[TEST] ============================================`);
    console.log(`[TEST] Starting full orientation flow simulation`);
    console.log(`[TEST] Application ID: ${args.applicationId}`);
    console.log(`[TEST] ============================================`);
    
    // Get orientation record first
    const orientation = await ctx.db
      .query("orientations")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .unique();

    if (!orientation) {
      throw new Error("No orientation scheduled for this application");
    }

    console.log(`[TEST] Orientation found:`);
    console.log(`[TEST] - Venue: ${orientation.orientationVenue}`);
    console.log(`[TEST] - Date: ${orientation.orientationDate ? new Date(orientation.orientationDate).toLocaleString() : 'N/A'}`);
    console.log(`[TEST] - Time Slot: ${orientation.timeSlot}`);
    console.log(`[TEST] - Status: ${orientation.orientationStatus}`);
    console.log(`[TEST] `);

    // Step 1: Check-in
    console.log(`[TEST] Step 1: Performing check-in...`);
    const checkInTime = Date.now();
    await ctx.db.patch(orientation._id, {
      checkInTime,
    });

    const application = await ctx.db.get(args.applicationId);
    if (application) {
      await ctx.db.insert("notifications", {
        userId: application.userId,
        applicationId: args.applicationId,
        title: "Orientation Check-In Successful",
        message: "You have been checked in for the food safety orientation.",
        notificationType: "Orientation",
        isRead: false,
      });
    }

    console.log(`[TEST] ✓ Check-in completed at ${new Date(checkInTime).toLocaleString()}`);
    console.log(`[TEST] `);

    // Step 2: Check-out
    console.log(`[TEST] Step 2: Performing check-out...`);
    const checkOutTime = Date.now();
    await ctx.db.patch(orientation._id, {
      checkOutTime,
      orientationStatus: "Completed",
    });

    if (application) {
      // Check if all documents are verified
      const documents = await ctx.db
        .query("documentUploads")
        .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
        .collect();
      
      const allDocumentsVerified = documents.length > 0 && documents.every(doc => doc.reviewStatus === "Verified");
      const newStatus = allDocumentsVerified ? "Under Review" : application.applicationStatus;
      
      await ctx.db.patch(args.applicationId, {
        applicationStatus: newStatus,
        orientationCompleted: true,
      });

      console.log(`[TEST] Documents status:`);
      console.log(`[TEST] - Total documents: ${documents.length}`);
      console.log(`[TEST] - All verified: ${allDocumentsVerified}`);
      console.log(`[TEST] - Application status: ${newStatus}`);

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

    console.log(`[TEST] ✓ Check-out completed at ${new Date(checkOutTime).toLocaleString()}`);
    console.log(`[TEST] `);
    console.log(`[TEST] ============================================`);
    console.log(`[TEST] Full orientation flow completed successfully!`);
    console.log(`[TEST] Duration: ${Math.round((checkOutTime - checkInTime) / 1000)} seconds`);
    console.log(`[TEST] Application status updated to: Under Review`);
    console.log(`[TEST] ============================================`);

    return {
      success: true,
      checkInTime,
      checkOutTime,
      duration: checkOutTime - checkInTime,
      message: "Full orientation flow completed successfully",
    };
  },
});
