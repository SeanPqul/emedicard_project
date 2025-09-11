import { query } from "../_generated/server";
import { v } from "convex/values";

// Admin query to get all pending documents for review
export const adminGetPendingDocumentUploadsQuery = query({
  args: {
    limit: v.optional(v.number()),
    applicationId: v.optional(v.id("applications")),
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
    
    // If applicationId is provided, filter by application
    if (args.applicationId) {
      allDocuments = await ctx.db
        .query("documentUploads")
        .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId!))
        .collect();
    } else {
      allDocuments = await ctx.db.query("documentUploads").collect();
    }
    const pendingDocuments = allDocuments.filter(doc => doc.reviewStatus === "Pending");
    
    // Apply limit if provided
    const limitedDocuments = args.limit 
      ? pendingDocuments.slice(0, args.limit)
      : pendingDocuments;
    
    // Get additional information for each document
    const documentsWithDetails = await Promise.all(
      limitedDocuments.map(async (doc) => {
        const application = await ctx.db.get(doc.applicationId);
        const documentType = await ctx.db.get(doc.documentTypeId);
        
        let applicant = null;
        if (application) {
          applicant = await ctx.db.get(application.userId);
        }
        
        return {
          ...doc,
          application,
          documentType,
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


// @deprecated - Use adminGetPendingDocumentUploadsQuery instead. This alias will be removed in a future release.
export const adminGetPendingDocuments = adminGetPendingDocumentUploadsQuery;
