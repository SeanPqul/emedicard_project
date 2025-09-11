// convex/admin/finalizeApplication.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { AdminRole } from "../users/roles";

export const finalize = mutation({
  args: {
    applicationId: v.id("applications"),
    newStatus: v.union(v.literal("Approved"), v.literal("Rejected")),
  },
  handler: async (ctx, args) => {
    await AdminRole(ctx); // Security check

    // 1. Get all uploaded documents for this application to validate them.
    const uploadedDocs = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", q => q.eq("applicationId", args.applicationId))
      .collect();

    // 2. Perform validation on the backend for security.
    if (uploadedDocs.some(doc => doc.reviewStatus === "Pending")) {
      throw new Error("Please review and assign a status (Approve or Reject) to all documents before proceeding.");
    }
    if (args.newStatus === "Rejected" && !uploadedDocs.some(doc => doc.reviewStatus === "Rejected")) {
      throw new Error("To reject the application, at least one document must be marked as 'Rejected'.");
    }

    // 3. THIS IS THE FIX: Determine the next status in the workflow.
    const nextApplicationStatus = args.newStatus === "Approved" 
      ? "For Payment Validation" // If approved, move to payment.
      : "Rejected";             // If rejected, the process stops here.

    // 4. Update the application's overall status.
    await ctx.db.patch(args.applicationId, {
      applicationStatus: nextApplicationStatus,
      updatedAt: Date.now(),
      // We only set `approvedAt` at the very end of the whole process.
    });

    return { success: true, nextStatus: nextApplicationStatus };
  },
});