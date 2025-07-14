import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFormRequirements = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const requirements = await ctx.db
      .query("requirements")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();

    return requirements;
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

    // Fallback to hardcoded requirements if database is empty
    const baseRequirements = [
      {
        name: "Valid ID",
        description: "Government-issued ID (Driver's License, National ID, Passport, etc.)",
        icon: "card-outline",
        required: true,
        fieldName: "validId"
      },
      {
        name: "2x2 Picture",
        description: "Recent colored photo with white background",
        icon: "camera-outline",
        required: true,
        fieldName: "picture"
      },
      {
        name: "Chest X-ray",
        description: "Recent chest X-ray result (within 6 months)",
        icon: "medical-outline",
        required: true,
        fieldName: "chestXrayId"
      },
      {
        name: "Urinalysis",
        description: "Complete urinalysis test result",
        icon: "flask-outline",
        required: true,
        fieldName: "urinalysisId"
      },
      {
        name: "Stool Examination",
        description: "Stool examination test result",
        icon: "analytics-outline",
        required: true,
        fieldName: "stoolId"
      },
      {
        name: "Cedula",
        description: "Community Tax Certificate (Cedula)",
        icon: "document-text-outline",
        required: true,
        fieldName: "cedulaId"
      }
    ];

    let additionalRequirements = [];

    // Add job-category specific requirements
    if (jobCategory.name.toLowerCase().includes("general")) {
      additionalRequirements.push(
        {
          name: "Drug Test",
          description: "Drug test result (Required for Security Guards)",
          icon: "shield-outline",
          required: false,
          fieldName: "drugTestId"
        },
        {
          name: "Neuropsychiatric Test",
          description: "Neuropsychiatric evaluation (Required for Security Guards)",
          icon: "medical-outline",
          required: false,
          fieldName: "neuroExamId"
        }
      );
    }

    // Add Hepatitis B for Pink health cards (skin-to-skin contact)
    if (jobCategory.colorCode === "#FF69B4" || jobCategory.name.toLowerCase().includes("skin")) {
      additionalRequirements.push({
        name: "Hepatitis B Antibody Test",
        description: "Hepatitis B surface antibody test result",
        icon: "shield-checkmark-outline",
        required: true,
        fieldName: "hepatitisBId"
      });
    }

    return {
      jobCategory,
      requirements: [...baseRequirements, ...additionalRequirements],
      totalRequirements: baseRequirements.length + additionalRequirements.length
    };
  },
});

export const uploadRequirements = mutation({
  args: {
    formId: v.id("forms"),
    validId: v.id("_storage"),
    picture: v.id("_storage"),
    chestXrayId: v.id("_storage"),
    urinalysisId: v.id("_storage"),
    stoolId: v.id("_storage"),
    cedulaId: v.id("_storage"),
    neuroExamId: v.optional(v.id("_storage")),
    drugTestId: v.optional(v.id("_storage")),
    hepatitisBId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const requirementId = await ctx.db.insert("requirements", {
      formId: args.formId,
      validId: args.validId,
      picture: args.picture,
      chestXrayId: args.chestXrayId,
      urinalysisId: args.urinalysisId,
      stoolId: args.stoolId,
      cedulaId: args.cedulaId,
      neuroExamId: args.neuroExamId,
      drugTestId: args.drugTestId,
      hepatitisBId: args.hepatitisBId,
    });

    return requirementId;
  },
});

export const updateRequirements = mutation({
  args: {
    requirementId: v.id("requirements"),
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
    const { requirementId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(requirementId, cleanUpdates);
    return requirementId;
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

// Upload a single document
export const uploadDocument = mutation({
  args: {
    formId: v.id("forms"),
    fieldName: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(args.fileType)) {
      throw new Error(`Invalid file type: ${args.fileType}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (args.fileSize > maxSize) {
      throw new Error(`File size exceeds limit. Maximum size: 10MB`);
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

    // Check if requirements record exists
    let requirements = await ctx.db
      .query("requirements")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();

    // Create requirements record if it doesn't exist
    if (!requirements) {
      // Create a minimal requirements record - we'll update it with the actual file
      const defaultStorageId = args.storageId; // Use the current file as default for all required fields
      
      const requirementId = await ctx.db.insert("requirements", {
        formId: args.formId,
        validId: args.fieldName === "validId" ? args.storageId : defaultStorageId,
        picture: args.fieldName === "picture" ? args.storageId : defaultStorageId,
        chestXrayId: args.fieldName === "chestXrayId" ? args.storageId : defaultStorageId,
        urinalysisId: args.fieldName === "urinalysisId" ? args.storageId : defaultStorageId,
        stoolId: args.fieldName === "stoolId" ? args.storageId : defaultStorageId,
        cedulaId: args.fieldName === "cedulaId" ? args.storageId : defaultStorageId,
        neuroExamId: args.fieldName === "neuroExamId" ? args.storageId : undefined,
        drugTestId: args.fieldName === "drugTestId" ? args.storageId : undefined,
        hepatitisBId: args.fieldName === "hepatitisBId" ? args.storageId : undefined,
      });
      
      requirements = await ctx.db.get(requirementId);
    } else {
      // Update existing requirements record
      await ctx.db.patch(requirements._id, {
        [args.fieldName]: args.storageId,
      });
    }

    return {
      requirementId: requirements!._id,
      fieldName: args.fieldName,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
    };
  },
});

// Update a single document field
export const updateDocumentField = mutation({
  args: {
    formId: v.id("forms"),
    fieldName: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(args.fileType)) {
      throw new Error(`Invalid file type: ${args.fileType}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (args.fileSize > maxSize) {
      throw new Error(`File size exceeds limit. Maximum size: 10MB`);
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
      throw new Error("Not authorized to update documents for this form");
    }

    // Get existing requirements
    let requirements = await ctx.db
      .query("requirements")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();

    if (!requirements) {
      throw new Error("Requirements record not found. Please upload documents first.");
    }

    // Update the specific field
    await ctx.db.patch(requirements._id, {
      [args.fieldName]: args.storageId,
    });

    return {
      requirementId: requirements._id,
      fieldName: args.fieldName,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
    };
  },
});

// Delete a document
export const deleteDocument = mutation({
  args: {
    formId: v.id("forms"),
    fieldName: v.string(),
    storageId: v.id("_storage"),
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
      throw new Error("Not authorized to delete documents for this form");
    }

    // Get existing requirements
    const requirements = await ctx.db
      .query("requirements")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();

    if (!requirements) {
      throw new Error("Requirements record not found");
    }

    // Delete the file from storage
    await ctx.storage.delete(args.storageId);

    // Update the requirements record to remove the reference
    await ctx.db.patch(requirements._id, {
      [args.fieldName]: undefined,
    });

    return { success: true };
  },
});

// Get document metadata
export const getDocumentMetadata = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get file URL from storage
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    
    return {
      storageId: args.storageId,
      url: fileUrl,
    };
  },
});

export const getRequirementsByFormId = query({
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

    const requirements = await ctx.db
      .query("requirements")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .unique();

    // Build the requirements structure inline to avoid circular reference
    const baseRequirements = [
      { name: "Valid ID", fieldName: "validId", required: true },
      { name: "2x2 Picture", fieldName: "picture", required: true },
      { name: "Chest X-ray", fieldName: "chestXrayId", required: true },
      { name: "Urinalysis", fieldName: "urinalysisId", required: true },
      { name: "Stool Examination", fieldName: "stoolId", required: true },
      { name: "Cedula", fieldName: "cedulaId", required: true }
    ];

    let additionalRequirements = [];
    if (jobCategory.name.toLowerCase().includes("security") || jobCategory.name.toLowerCase().includes("guard")) {
      additionalRequirements.push(
        { name: "Neuropsychiatric Examination", fieldName: "neuroExamId", required: true },
        { name: "Drug Test", fieldName: "drugTestId", required: true }
      );
    }
    if (jobCategory.colorCode.toLowerCase() === "#ffc0cb" || jobCategory.name.toLowerCase().includes("pink")) {
      additionalRequirements.push(
        { name: "Hepatitis B Test", fieldName: "hepatitisBId", required: true }
      );
    }

    const allRequiredDocs = [...baseRequirements, ...additionalRequirements];

    return {
      form,
      jobCategory,
      uploadedRequirements: requirements,
      requiredDocuments: allRequiredDocs,
      totalRequired: allRequiredDocs.length
    };
  },
});
