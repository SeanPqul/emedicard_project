import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFormDocuments = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("formDocuments")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .collect();

    return documents;
  },
});

export const getRequirementsByJobCategory = query({
  args: { jobCategoryId: v.id("jobCategory") },
  handler: async (ctx, args) => {
    const jobCategory = await ctx.db.get(args.jobCategoryId);
    if (!jobCategory) {
      throw new Error("Job category not found");
    }

    // Try to get requirements from database first
    const dbRequirements = await ctx.db
      .query("documentRequirements")
      .withIndex("by_job_category", (q) => q.eq("jobCategoryId", args.jobCategoryId))
      .collect();

    if (dbRequirements.length > 0) {
      // Return database requirements
      const transformedRequirements = dbRequirements.map(req => ({
        name: req.name,
        description: req.description,
        icon: req.icon,
        required: req.required,
        fieldName: req.fieldName
      }));

      return {
        jobCategory,
        requirements: transformedRequirements,
        totalRequirements: dbRequirements.length
      };
    }

    // Fallback: Return empty requirements array if database is empty
    // This ensures the system will work only with dynamic requirements from the database
    console.warn(
      `No document requirements found in database for job category: ${jobCategory.name}. ` +
      "Please ensure document requirements are properly configured in the database."
    );
    
    return {
      jobCategory,
      requirements: [],
      totalRequirements: 0
    };
  },
});

// Legacy function - kept for backward compatibility but should be migrated
// Note: This function used hardcoded document keys and is now deprecated
export const uploadRequirements = mutation({
  args: {
    formId: v.id("forms"),
    // Legacy hardcoded fields - no longer supported
    validId: v.optional(v.id("_storage")),
    picture: v.optional(v.id("_storage")),
    chestXrayId: v.optional(v.id("_storage")),
    urinalysisId: v.optional(v.id("_storage")),
    stoolId: v.optional(v.id("_storage")),
    cedulaId: v.optional(v.id("_storage")),
    neuroExamId: v.optional(v.id("_storage")),
    drugTestId: v.optional(v.id("_storage")),
    hepatitisBId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // This function is deprecated - use uploadDocument instead with dynamic fieldName from documentRequirements
    throw new Error(
      "This function is deprecated and used hardcoded document keys. " +
      "Please use uploadDocument instead with dynamic fieldName from documentRequirements table."
    );
  },
});

// Legacy function - kept for backward compatibility but should be migrated
// Note: This function used hardcoded document keys and is now deprecated
export const updateRequirements = mutation({
  args: {
    requirementId: v.id("formDocuments"),
    // Legacy hardcoded fields - no longer supported
    validId: v.optional(v.id("_storage")),
    picture: v.optional(v.id("_storage")),
    chestXrayId: v.optional(v.id("_storage")),
    urinalysisId: v.optional(v.id("_storage")),
    stoolId: v.optional(v.id("_storage")),
    cedulaId: v.optional(v.id("_storage")),
    neuroExamId: v.optional(v.id("_storage")),
    drugTestId: v.optional(v.id("_storage")),
    hepatitisBId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    // This function is deprecated - use updateDocument instead with dynamic fieldName from documentRequirements
    throw new Error(
      "This function is deprecated and used hardcoded document keys. " +
      "Please use updateDocument instead with dynamic fieldName from documentRequirements table."
    );
  },
});

// Generate upload URL for files
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Upload a single document using the new formDocuments schema
export const uploadDocument = mutation({
  args: {
    formId: v.id("forms"),
    documentRequirementId: v.id("documentRequirements"),
    type: v.string(), // e.g., "validId", "urinalysis", etc.
    fileName: v.string(),
    fileId: v.id("_storage"),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify form exists and user owns it
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Form not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || form.userId !== user._id) {
      throw new Error("Not authorized to upload documents for this form");
    }

    // Verify document requirement exists
    const docRequirement = await ctx.db.get(args.documentRequirementId);
    if (!docRequirement) {
      throw new Error("Document requirement not found");
    }

    // Check if document already exists for this form and type
    const existingDoc = await ctx.db
      .query("formDocuments")
      .withIndex("by_form_type", (q) => q.eq("formId", args.formId).eq("type", args.type))
      .unique();

    if (existingDoc) {
      // Update existing document
      await ctx.db.patch(existingDoc._id, {
        documentRequirementId: args.documentRequirementId,
        fileName: args.fileName,
        fileId: args.fileId,
        uploadedAt: Date.now(),
        status: "Pending",
        remarks: undefined, // Clear any previous remarks
      });
      
      return existingDoc._id;
    } else {
      // Create new document record
      const documentId = await ctx.db.insert("formDocuments", {
        formId: args.formId,
        documentRequirementId: args.documentRequirementId,
        type: args.type,
        fileName: args.fileName,
        fileId: args.fileId,
        uploadedAt: Date.now(),
        status: "Pending",
      });
      
      return documentId;
    }
  },
});

// Update a single document using formDocuments schema
export const updateDocument = mutation({
  args: {
    documentId: v.id("formDocuments"),
    fileName: v.string(),
    fileId: v.id("_storage"),
    status: v.optional(v.union(
      v.literal("Pending"),
      v.literal("Approved"),
      v.literal("Rejected")
    )),
    remarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Verify form exists and user owns it
    const form = await ctx.db.get(document.formId);
    if (!form) {
      throw new Error("Form not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || form.userId !== user._id) {
      throw new Error("Not authorized to update this document");
    }

    await ctx.db.patch(args.documentId, {
      fileName: args.fileName,
      fileId: args.fileId,
      uploadedAt: Date.now(),
      status: args.status || "Pending",
      remarks: args.remarks,
    });

    return args.documentId;
  },
});

// Delete a document using formDocuments schema
export const deleteDocument = mutation({
  args: {
    documentId: v.id("formDocuments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Verify form exists and user owns it
    const form = await ctx.db.get(document.formId);
    if (!form) {
      throw new Error("Form not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || form.userId !== user._id) {
      throw new Error("Not authorized to delete this document");
    }

    // Delete the file from storage
    await ctx.storage.delete(document.fileId);

    // Delete the document record
    await ctx.db.delete(args.documentId);

    return { success: true };
  },
});

// Get document URL from storage
export const getDocumentUrl = query({
  args: {
    documentId: v.id("formDocuments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Get file URL from storage
    const fileUrl = await ctx.storage.getUrl(document.fileId);
    
    return {
      documentId: args.documentId,
      fileName: document.fileName,
      type: document.type,
      url: fileUrl,
      status: document.status,
      uploadedAt: document.uploadedAt,
      remarks: document.remarks,
    };
  },
});

// Get form documents with requirements info
export const getFormDocumentsById = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Form not found");
    }

    const jobCategory = await ctx.db.get(form.jobCategory);
    if (!jobCategory) {
      throw new Error("Job category not found");
    }

    // Get uploaded documents
    const uploadedDocuments = await ctx.db
      .query("formDocuments")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .collect();

    // Get document requirements for this job category
    const documentRequirements = await ctx.db
      .query("documentRequirements")
      .withIndex("by_job_category", (q) => q.eq("jobCategoryId", form.jobCategory))
      .collect();

    // Map uploaded documents with their requirements
    const documentsWithRequirements = await Promise.all(
      uploadedDocuments.map(async (doc) => {
        const requirement = await ctx.db.get(doc.documentRequirementId);
        return {
          ...doc,
          requirement,
        };
      })
    );

    return {
      form,
      jobCategory,
      uploadedDocuments: documentsWithRequirements,
      requiredDocuments: documentRequirements,
      totalRequired: documentRequirements.length,
      totalUploaded: uploadedDocuments.length,
    };
  },
});
