import { query } from "../_generated/server";
import { v } from "convex/values";

// Admin query to get all pending documents for review
export const adminGetPendingDocuments = query({
  args: {
    limit: v.optional(v.number()),
    formId: v.optional(v.id("forms")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get pending documents
    let allDocuments;
    
    // If formId is provided, filter by form
    if (args.formId) {
      allDocuments = await ctx.db
        .query("formDocuments")
        .withIndex("by_form", (q) => q.eq("formId", args.formId!))
        .collect();
    } else {
      allDocuments = await ctx.db.query("formDocuments").collect();
    }
    const pendingDocuments = allDocuments.filter(doc => doc.status === "Pending");
    
    // Apply limit if provided
    const limitedDocuments = args.limit 
      ? pendingDocuments.slice(0, args.limit)
      : pendingDocuments;
    
    // Get additional information for each document
    const documentsWithDetails = await Promise.all(
      limitedDocuments.map(async (doc) => {
        const form = await ctx.db.get(doc.formId);
        const requirement = await ctx.db.get(doc.documentRequirementId);
        
        let applicant = null;
        if (form) {
          applicant = await ctx.db.get(form.userId);
        }
        
        return {
          ...doc,
          form,
          requirement,
          applicant: applicant ? {
            _id: applicant._id,
            fullname: applicant.fullname,
            email: applicant.email,
          } : null,
        };
      })
    );
    
    return {
      documents: documentsWithDetails,
      totalPending: pendingDocuments.length,
      totalReturned: documentsWithDetails.length,
    };
  },
});
