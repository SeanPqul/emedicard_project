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
