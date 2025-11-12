import { internalMutation } from "../_generated/server";

/**
 * Migration: Update "Locked - Max Attempts" to "Under Administrative Review"
 * 
 * This migration updates all applications with the old unprofessional status
 * to the new professional terminology.
 * 
 * Run this once to fix existing data in the database.
 */
export const updateLockedApplicationStatus = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting migration: Update locked application status...");
    
    // Find all applications with old "Locked - Max Attempts" status
    const allApplications = await ctx.db.query("applications").collect();
    
    const lockedApplications = allApplications.filter(
      app => app.applicationStatus === "Locked - Max Attempts"
    );
    
    console.log(`📋 Found ${lockedApplications.length} applications with old status`);
    
    if (lockedApplications.length === 0) {
      console.log("✅ No applications need updating!");
      return {
        success: true,
        message: "No applications with old status found",
        updatedCount: 0,
      };
    }
    
    // Update each application
    let updatedCount = 0;
    for (const app of lockedApplications) {
      await ctx.db.patch(app._id, {
        applicationStatus: "Under Administrative Review",
        adminRemarks: app.adminRemarks 
          ? app.adminRemarks.replace("Locked - Max Attempts", "Under Administrative Review")
          : "Application requires manual review: Maximum payment submission attempts (3) has been reached. Pending support team evaluation.",
        updatedAt: Date.now(),
      });
      updatedCount++;
      console.log(`✅ Updated application ${app._id}`);
    }
    
    console.log(`✅ Migration complete! Updated ${updatedCount} applications`);
    
    return {
      success: true,
      message: `Successfully updated ${updatedCount} applications from "Locked - Max Attempts" to "Under Administrative Review"`,
      updatedCount,
      applicationIds: lockedApplications.map(app => app._id),
    };
  },
});
