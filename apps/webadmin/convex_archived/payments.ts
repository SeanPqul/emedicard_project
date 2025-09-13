import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { AdminRole } from "./users/roles";

export const getByApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
      .first();
  },
});

export const updateStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(v.literal("Complete"), v.literal("Failed")),
  },
  handler: async (ctx, { paymentId, status }) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) {
      throw new Error("You do not have permission to update payment status.");
    }

    await ctx.db.patch(paymentId, { paymentStatus: status });
    return { success: true };
  },
});

export const getReceiptUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});
