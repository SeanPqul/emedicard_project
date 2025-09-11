import { mutation } from "../_generated/server";

// Safe mutation to clear only notifications table
export const clearNotificationsTable = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🗑️ Clearing notifications table...");
    
    const notifications = await ctx.db.query("notifications").collect();
    
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }
    
    console.log(`✅ Deleted ${notifications.length} notifications`);
    
    return {
      success: true,
      message: `Cleared ${notifications.length} notifications. Users and other data preserved.`,
      deletedCount: notifications.length
    };
  }
});