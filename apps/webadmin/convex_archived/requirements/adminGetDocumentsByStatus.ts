import { query } from "../_generated/server";
import { v } from "convex/values";

// Admin query to get documents by status
export const adminGetDocumentUploadsByStatusQuery = query({
  args: {
    status: v.union(v.literal("Pending"), v.literal("Approved"), v.literal("Rejected")),
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

    // Get documents by status
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
    const filteredDocuments = allDocuments.filter(doc => doc.reviewStatus === args.status);
    
    // Apply limit if provided
    const limitedDocuments = args.limit 
      ? filteredDocuments.slice(0, args.limit)
      : filteredDocuments;
    
    // Get additional information for each document
    const documentsWithDetails = await Promise.all(
      limitedDocuments.map(async (doc) => {
        const application = await ctx.db.get(doc.applicationId);
        const documentType = await ctx.db.get(doc.documentTypeId);
        
        let applicant = null;
        let reviewer = null;
        
        if (application) {
          applicant = await ctx.db.get(application.userId);
        }
        
        if (doc.reviewedBy) {
          reviewer = await ctx.db.get(doc.reviewedBy);
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
          reviewer: reviewer ? {
            _id: reviewer._id,
            fullname: reviewer.fullname,
            email: reviewer.email,
          } : null,
        };
      })
    );
    
    return {
      documents: documentsWithDetails,
      totalFound: filteredDocuments.length,
      totalReturned: documentsWithDetails.length,
      status: args.status,
    };
  },
});


// @deprecated - Use adminGetDocumentUploadsByStatusQuery instead. This alias will be removed in a future release.
export const adminGetDocumentsByStatus = adminGetDocumentUploadsByStatusQuery;
