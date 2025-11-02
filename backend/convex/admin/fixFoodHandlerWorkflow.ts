/**
 * Admin utility to fix Food Handler applications that are stuck in the wrong status
 * due to the orientation requirement bug
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { AdminRole } from "../users/roles";

/**
 * Query to check Food Handler job category orientation setting
 */
export const checkFoodHandlerOrientation = query({
  args: {},
  handler: async (ctx) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Not authorized");
    }

    const foodHandler = await ctx.db
      .query("jobCategories")
      .filter((q) => q.eq(q.field("name"), "Food Handler"))
      .first();

    if (!foodHandler) {
      return { error: "Food Handler job category not found" };
    }

    return {
      jobCategoryId: foodHandler._id,
      name: foodHandler.name,
      requireOrientation: foodHandler.requireOrientation,
      isCorrect: foodHandler.requireOrientation === true || foodHandler.requireOrientation === "true",
    };
  },
});

/**
 * Fix Food Handler job category to require orientation
 */
export const fixFoodHandlerOrientation = mutation({
  args: {},
  handler: async (ctx) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Not authorized");
    }

    const foodHandler = await ctx.db
      .query("jobCategories")
      .filter((q) => q.eq(q.field("name"), "Food Handler"))
      .first();

    if (!foodHandler) {
      throw new Error("Food Handler job category not found");
    }

    if (foodHandler.requireOrientation === true) {
      return {
        success: true,
        message: "Food Handler already has requireOrientation set to true",
        alreadyFixed: true,
      };
    }

    await ctx.db.patch(foodHandler._id, {
      requireOrientation: true,
    });

    return {
      success: true,
      message: "Food Handler job category updated to require orientation",
      alreadyFixed: false,
    };
  },
});

/**
 * Find Food Handler applications that are in the wrong status
 */
export const findBrokenFoodHandlerApplications = query({
  args: {},
  handler: async (ctx) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Not authorized");
    }

    // Find Food Handler job category
    const foodHandler = await ctx.db
      .query("jobCategories")
      .filter((q) => q.eq(q.field("name"), "Food Handler"))
      .first();

    if (!foodHandler) {
      return { error: "Food Handler job category not found", applications: [] };
    }

    // Find all Food Handler applications
    const applications = await ctx.db
      .query("applications")
      .filter((q) => q.eq(q.field("jobCategoryId"), foodHandler._id))
      .collect();

    // Find broken applications: those with "For Document Verification" status
    // that haven't completed orientation and have approved payment
    const brokenApps = [];

    for (const app of applications) {
      // Check if status is "For Document Verification"
      if (app.applicationStatus === "For Document Verification") {
        // Check if orientation is NOT completed
        if (!app.orientationCompleted) {
          // Check if payment is approved (Complete)
          const payment = await ctx.db
            .query("payments")
            .withIndex("by_application", (q) => q.eq("applicationId", app._id))
            .first();

          if (payment && payment.paymentStatus === "Complete") {
            // This is a broken application!
            const user = await ctx.db.get(app.userId);
            brokenApps.push({
              applicationId: app._id,
              userId: app.userId,
              userName: user?.fullname || "Unknown",
              currentStatus: app.applicationStatus,
              orientationCompleted: app.orientationCompleted,
              paymentStatus: payment.paymentStatus,
              submittedAt: app._creationTime,
            });
          }
        }
      }
    }

    return {
      totalChecked: applications.length,
      brokenCount: brokenApps.length,
      applications: brokenApps,
    };
  },
});

/**
 * Fix a specific Food Handler application by setting it to "For Orientation"
 */
export const fixBrokenApplication = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Not authorized");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed");

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!adminUser) throw new Error("Admin user not found");

    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Verify this is a Food Handler application
    const jobCategory = await ctx.db.get(application.jobCategoryId);
    if (!jobCategory || jobCategory.name !== "Food Handler") {
      throw new Error("This is not a Food Handler application");
    }

    // Update status to "For Orientation"
    await ctx.db.patch(args.applicationId, {
      applicationStatus: "For Orientation",
      orientationCompleted: false,
      updatedAt: Date.now(),
      lastUpdatedBy: adminUser._id,
    });

    // Log admin activity
    await ctx.db.insert("adminActivityLogs", {
      adminId: adminUser._id,
      activityType: "application_status_update",
      details: `Fixed broken Food Handler application - changed status from "For Document Verification" to "For Orientation"`,
      timestamp: Date.now(),
      applicationId: args.applicationId,
      jobCategoryId: application.jobCategoryId,
    });

    // Send notification to user
    await ctx.db.insert("notifications", {
      userId: application.userId,
      applicationId: args.applicationId,
      title: "Application Status Updated",
      message: "Your application status has been updated. Please proceed to schedule your food safety orientation.",
      notificationType: "status_update",
      isRead: false,
    });

    return {
      success: true,
      message: "Application status updated to 'For Orientation'",
    };
  },
});

/**
 * Batch fix all broken Food Handler applications
 */
export const fixAllBrokenApplications = mutation({
  args: {},
  handler: async (ctx) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("Not authorized");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed");

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!adminUser) throw new Error("Admin user not found");

    // Find Food Handler job category
    const foodHandler = await ctx.db
      .query("jobCategories")
      .filter((q) => q.eq(q.field("name"), "Food Handler"))
      .first();

    if (!foodHandler) {
      throw new Error("Food Handler job category not found");
    }

    // Find all broken applications
    const applications = await ctx.db
      .query("applications")
      .filter((q) => q.eq(q.field("jobCategoryId"), foodHandler._id))
      .collect();

    let fixedCount = 0;

    for (const app of applications) {
      // Check if status is "For Document Verification" and orientation not completed
      if (app.applicationStatus === "For Document Verification" && !app.orientationCompleted) {
        // Check if payment is approved
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_application", (q) => q.eq("applicationId", app._id))
          .first();

        if (payment && payment.paymentStatus === "Complete") {
          // Fix this application
          await ctx.db.patch(app._id, {
            applicationStatus: "For Orientation",
            orientationCompleted: false,
            updatedAt: Date.now(),
            lastUpdatedBy: adminUser._id,
          });

          // Send notification
          await ctx.db.insert("notifications", {
            userId: app.userId,
            applicationId: app._id,
            title: "Application Status Updated",
            message: "Your application status has been updated. Please proceed to schedule your food safety orientation.",
            notificationType: "status_update",
            isRead: false,
          });

          fixedCount++;
        }
      }
    }

    // Log admin activity
    if (fixedCount > 0) {
      await ctx.db.insert("adminActivityLogs", {
        adminId: adminUser._id,
        activityType: "batch_status_update",
        details: `Fixed ${fixedCount} broken Food Handler applications - changed status to "For Orientation"`,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      fixedCount,
      message: `Fixed ${fixedCount} broken Food Handler application(s)`,
    };
  },
});
