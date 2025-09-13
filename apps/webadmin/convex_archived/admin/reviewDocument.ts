// convex/admin/reviewDocument.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { AdminRole } from "../users/roles";

export const review = mutation({
  args: {
    // This is now the ID of the documentUploads record
    documentUploadId: v.id("documentUploads"),
    status: v.union(v.literal("Approved"), v.literal("Rejected")),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminCheck = await AdminRole(ctx);
    if (!adminCheck.isAdmin) throw new Error("Not authorized");

    const identity = await ctx.auth.getUserIdentity();
    const adminUser = await ctx.db.query("users").withIndex("by_clerk_id", q => q.eq("clerkId", identity!.subject)).unique();
    if (!adminUser) throw new Error("Admin user not found.");

    await ctx.db.patch(args.documentUploadId, {
      reviewStatus: args.status,
      adminRemarks: args.remarks,
      reviewedAt: Date.now(),
      reviewedBy: adminUser._id,
    });

    return { success: true };
  },
});