import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Migration to add role field to existing users
export const migrateUsersAddRole = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    let migratedCount = 0;
    
    for (const user of users) {
      // If user doesn't have a role field, add it with default 'applicant'
      if (!user.role) {
        await ctx.db.patch(user._id, { role: "applicant" });
        migratedCount++;
      }
    }
    
    return {
      success: true,
      message: `Migrated ${migratedCount} users to have role field`,
      totalUsers: users.length,
      migratedCount
    };
  }
});

// Note: Admin functionality is handled via separate web interface

// Helper function to set user role (for admin use)
export const setUserRole = mutation({
  args: {
    clerkId: v.string(),
    role: v.string()
  },
  handler: async (ctx, args) => {
    // Validate role
    if (!["applicant", "inspector", "admin"].includes(args.role)) {
      throw new Error("Invalid role. Must be 'applicant', 'inspector', or 'admin'");
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    await ctx.db.patch(user._id, { role: args.role as "applicant" | "inspector" | "admin" });
    
    return {
      success: true,
      message: `User ${user.fullname} role updated to ${args.role}`,
      userId: user._id,
      newRole: args.role
    };
  }
});

// Migration to add status field to existing forms
export const migrateFormsAddStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const forms = await ctx.db.query("forms").collect();
    
    let migratedCount = 0;
    
    for (const form of forms) {
      // If form doesn't have a status field, add it with default 'Submitted'
      if (!form.status) {
        await ctx.db.patch(form._id, { status: "Submitted" });
        migratedCount++;
      }
    }
    
    return {
      success: true,
      message: `Migrated ${migratedCount} forms to have status field`,
      totalForms: forms.length,
      migratedCount
    };
  }
});

// Migration to fix requireOrientation field in jobCategory
export const migrateJobCategoryRequireOrientation = mutation({
  args: {},
  handler: async (ctx) => {
    const jobCategories = await ctx.db.query("jobCategory").collect();
    
    let migratedCount = 0;
    
    for (const jobCategory of jobCategories) {
      // Convert string values to boolean
      const orientation = (jobCategory as any).requireOrientation;
      if (typeof orientation === 'string') {
        const boolValue = orientation.toLowerCase() === 'yes' || orientation.toLowerCase() === 'true';
        await ctx.db.patch(jobCategory._id, { requireOrientation: boolValue });
        migratedCount++;
      } else if (orientation === undefined || orientation === null) {
        // Set default value for missing field
        await ctx.db.patch(jobCategory._id, { requireOrientation: false });
        migratedCount++;
      }
    }
    
    return {
      success: true,
      message: `Migrated ${migratedCount} job categories to have proper requireOrientation field`,
      totalJobCategories: jobCategories.length,
      migratedCount
    };
  }
});

// Migration to add title field to existing notifications
export const migrateNotificationsAddTitle = mutation({
  args: {},
  handler: async (ctx) => {
    const notifications = await ctx.db.query("notifications").collect();
    
    let migratedCount = 0;
    
    for (const notification of notifications) {
      // If notification doesn't have a title field, add a default one based on type
      if (!notification.title) {
        let title = "Notification";
        switch (notification.type) {
          case "PaymentReceived":
            title = "Payment Update";
            break;
          case "FormApproved":
            title = "Application Approved";
            break;
          case "MissingDoc":
            title = "Document Required";
            break;
          case "OrientationScheduled":
            title = "Orientation Update";
            break;
          case "CardIssue":
            title = "Health Card";
            break;
          default:
            title = "System Notification";
        }
        
        await ctx.db.patch(notification._id, { title });
        migratedCount++;
      }
    }
    
    return {
      success: true,
      message: `Migrated ${migratedCount} notifications to have title field`,
      totalNotifications: notifications.length,
      migratedCount
    };
  }
});

// Clean up any problematic data that doesn't match schema
export const cleanupDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🧹 Cleaning up database for schema compliance...");
    
    // Get all forms and check for any other schema issues
    const forms = await ctx.db.query("forms").collect();
    const formDocuments = await ctx.db.query("formDocuments").collect();
    
    let deletedDocs = 0;
    
    // Remove any formDocuments that might have schema issues
    for (const doc of formDocuments) {
      // Check if document has any extra fields that don't match schema
      if ((doc as any).type !== undefined) {
        await ctx.db.delete(doc._id);
        deletedDocs++;
      }
    }
    
    console.log(`🗑️  Removed ${deletedDocs} problematic form documents`);
    
    return {
      message: "Database cleanup completed",
      formsCount: forms.length,
      deletedDocuments: deletedDocs
    };
  },
});

// Complete database reset for fresh start
export const resetDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Performing complete database reset...");
    
    // Delete all data in order (respecting foreign key constraints)
    const tables = [
      "verificationLogs",
      "healthCards", 
      "orientations",
      "payments",
      "formDocuments",
      "forms",
      "jobCategoryRequirements",
      "documentRequirements",
      "jobCategory",
      "notifications"
    ];
    
    const deleteCounts: Record<string, number> = {};
    
    for (const tableName of tables) {
      const records = await ctx.db.query(tableName as any).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
      deleteCounts[tableName] = records.length;
      console.log(`Deleted ${records.length} records from ${tableName}`);
    }
    
    return {
      message: "✅ Database reset completed",
      deleteCounts
    };
  },
});
