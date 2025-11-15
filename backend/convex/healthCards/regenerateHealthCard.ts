import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Manually regenerate a health card for an approved application
 * Useful for testing or when a health card generation failed
 */
export const regenerate = mutation({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // Check if application is approved
    const application = await ctx.db.get(args.applicationId);
    
    if (!application) {
      throw new Error("Application not found");
    }
    
    if (application.applicationStatus !== "Approved") {
      throw new Error("Application must be approved before generating health card");
    }
    
    // Delete existing health card if any
    const existingHealthCard = await ctx.db
      .query("healthCards")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId))
      .first();
    
    if (existingHealthCard) {
      await ctx.db.delete(existingHealthCard._id);
      console.log("Deleted existing health card:", existingHealthCard._id);
    }
    
    // Trigger health card generation
    await ctx.scheduler.runAfter(0, internal.healthCards.generateHealthCard.generateHealthCard, {
      applicationId: args.applicationId,
    });
    
    return { success: true, message: "Health card generation triggered" };
  },
});
