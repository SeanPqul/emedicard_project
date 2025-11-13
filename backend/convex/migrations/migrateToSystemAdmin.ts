/**
 * Migration: Convert Super Admins to System Administrator Role
 * 
 * This migration updates users who are currently "admin" with no managedCategories
 * to the new "system_admin" role for better clarity and professionalism.
 * 
 * Run this migration once after deploying the schema changes.
 */

import { internalMutation } from "../_generated/server";

export const migrateToSystemAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    const startTime = Date.now();
    let updatedCount = 0;
    let skippedCount = 0;
    
    console.log("🔄 Starting migration: Super Admin → System Administrator");
    
    // Find all users with admin role
    const allAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();
    
    console.log(`📊 Found ${allAdmins.length} admin users to review`);
    
    for (const admin of allAdmins) {
      // Only migrate admins without managedCategories (Super Admins)
      if (!admin.managedCategories || admin.managedCategories.length === 0) {
        await ctx.db.patch(admin._id, {
          role: "system_admin",
          updatedAt: Date.now(),
        });
        updatedCount++;
        console.log(`✅ Migrated: ${admin.email} → system_admin`);
      } else {
        skippedCount++;
        console.log(`⏭️  Skipped: ${admin.email} (has managed categories)`);
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log("\n📈 Migration Summary:");
    console.log(`   ✅ Updated: ${updatedCount} users to system_admin`);
    console.log(`   ⏭️  Skipped: ${skippedCount} regular admins`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log("✨ Migration completed successfully!\n");
    
    return {
      success: true,
      updated: updatedCount,
      skipped: skippedCount,
      duration,
    };
  },
});

/**
 * Rollback migration - converts system_admin back to admin
 * Use this only if you need to revert the migration
 */
export const rollbackSystemAdmin = internalMutation({
  args: {},
  handler: async (ctx) => {
    const startTime = Date.now();
    let revertedCount = 0;
    
    console.log("🔄 Starting rollback: System Administrator → Admin");
    
    const systemAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "system_admin"))
      .collect();
    
    console.log(`📊 Found ${systemAdmins.length} system_admin users to revert`);
    
    for (const sysAdmin of systemAdmins) {
      await ctx.db.patch(sysAdmin._id, {
        role: "admin",
        managedCategories: undefined, // Remove to make them super admin again
        updatedAt: Date.now(),
      });
      revertedCount++;
      console.log(`↩️  Reverted: ${sysAdmin.email} → admin (super)`);
    }
    
    const duration = Date.now() - startTime;
    
    console.log("\n📈 Rollback Summary:");
    console.log(`   ↩️  Reverted: ${revertedCount} users`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log("✨ Rollback completed!\n");
    
    return {
      success: true,
      reverted: revertedCount,
      duration,
    };
  },
});
