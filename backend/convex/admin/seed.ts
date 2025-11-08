import { Id } from "../_generated/dataModel";
import { mutation } from "../_generated/server";

// Seed job categories, document types, and their relationships
export const seedJobCategoriesAndRequirements = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting database seeding...");

    //Insert job categories
    const jobCategories = [
      { name: "Food Category", colorCode: "#FFD700", requireOrientation: "Yes" },
      { name: "Non-Food Category", colorCode: "#00FF00", requireOrientation: "No" },
      { name: "Skin-to-Skin Category", colorCode: "#FF69B4", requireOrientation: "No" },
    ];

    const jobCategoryIds: Record<string, Id<"jobCategories">> = {};
    for (const category of jobCategories) {
      const existing = await ctx.db
        .query("jobCategories")
        .filter((q) => q.eq(q.field("name"), category.name))
        .first();

      if (existing) {
        jobCategoryIds[category.name] = existing._id;
      } else {
        const id = await ctx.db.insert("jobCategories", category);
        jobCategoryIds[category.name] = id;
      }
    }

    //Insert document types
    const documentTypes = [
      { name: "Valid Government ID", fieldIdentifier: "validId", description: "Any valid government-issued ID", icon: "card-outline", isRequired: true },
      { name: "2x2 ID Picture", fieldIdentifier: "picture", description: "Recent colored 2x2 ID picture", icon: "camera-outline", isRequired: true },
      { name: "Chest X-ray", fieldIdentifier: "chestXrayId", description: "Recent chest X-ray result", icon: "medical-outline", isRequired: true },
      { name: "Urinalysis", fieldIdentifier: "urinalysisId", description: "Complete urinalysis test", icon: "flask-outline", isRequired: true },
      { name: "Stool Examination", fieldIdentifier: "stoolId", description: "Stool examination result", icon: "analytics-outline", isRequired: true },
      { name: "Cedula", fieldIdentifier: "cedulaId", description: "Community Tax Certificate", icon: "document-text-outline", isRequired: true },
      { name: "Drug Test", fieldIdentifier: "drugTestId", description: "Drug test result (for Security Guards)", icon: "shield-outline", isRequired: false },
      { name: "Neuropsychiatric Test", fieldIdentifier: "neuroExamId", description: "Neuropsychiatric evaluation (for Security Guards)", icon: "medical-outline", isRequired: false },
      { name: "Hepatitis B Antibody Test", fieldIdentifier: "hepatitisBId", description: "Hepatitis B surface antibody test result", icon: "shield-checkmark-outline", isRequired: false },
    ];

    const documentIds: Record<string, Id<"documentTypes">> = {};
    for (const doc of documentTypes) {
      const existing = await ctx.db
        .query("documentTypes")
        .withIndex("by_field_identifier", (q) => q.eq("fieldIdentifier", doc.fieldIdentifier))
        .first();

      if (existing) {
        documentIds[doc.name] = existing._id;
      } else {
        const id = await ctx.db.insert("documentTypes", doc);
        documentIds[doc.name] = id;
      }
    }

    //Link documents to categories
    const categoryRequirementMap: Record<string, { name: string; required: boolean }[]> = {
      "Food Category": [
        { name: "Valid Government ID", required: true },
        { name: "2x2 ID Picture", required: true },
        { name: "Chest X-ray", required: true },
        { name: "Urinalysis", required: true },
        { name: "Stool Examination", required: true },
        { name: "Cedula", required: true },
      ],
      "Non-Food Category": [
        { name: "Valid Government ID", required: true },
        { name: "2x2 ID Picture", required: true },
        { name: "Chest X-ray", required: true },
        { name: "Urinalysis", required: true },
        { name: "Stool Examination", required: true },
        { name: "Cedula", required: true },
        { name: "Drug Test", required: false },
        { name: "Neuropsychiatric Test", required: false },
      ],
      "Skin-to-Skin Category": [
        { name: "Valid Government ID", required: true },
        { name: "2x2 ID Picture", required: true },
        { name: "Chest X-ray", required: true },
        { name: "Urinalysis", required: true },
        { name: "Stool Examination", required: true },
        { name: "Cedula", required: true },
        { name: "Hepatitis B Antibody Test", required: false },
      ],
    };

    let linkedCount = 0;

    for (const [categoryName, reqList] of Object.entries(categoryRequirementMap)) {
      const jobCategoryId = jobCategoryIds[categoryName];
      if (!jobCategoryId) {
        console.warn(`⚠️ Skipping category ${categoryName} - ID not found`);
        continue;
      }
      
      for (const req of reqList) {
        const documentTypeId = documentIds[req.name];
        if (!documentTypeId) {
          console.warn(`⚠️ Skipping document ${req.name} - ID not found`);
          continue;
        }

        // Check if link already exists
        const existing = await ctx.db
          .query("jobCategoryDocuments")
          .withIndex("by_job_category", (q) => q.eq("jobCategoryId", jobCategoryId))
          .collect();

        const alreadyLinked = existing.some((e) => e.documentTypeId === documentTypeId);
        if (!alreadyLinked) {
          await ctx.db.insert("jobCategoryDocuments", {
            jobCategoryId,
            documentTypeId,
            isRequired: req.required,
          });
          linkedCount++;
        }
      }
    }

    return {
      message: "✅ Database seed complete",
      categoriesCreated: jobCategories.length,
      documentTypesCreated: Object.keys(documentIds).length,
      linksCreated: linkedCount,
    };
  },
});
export const clearSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    const links = await ctx.db.query("jobCategoryDocuments").collect();
    for (const link of links) await ctx.db.delete(link._id);

    const docs = await ctx.db.query("documentTypes").collect();
    for (const doc of docs) await ctx.db.delete(doc._id);

    const categories = await ctx.db.query("jobCategories").collect();
    for (const cat of categories) await ctx.db.delete(cat._id);

    return {
      message: "🧹 Seed data cleared",
      deleted: {
        jobCategoryDocuments: links.length,
        documentTypes: docs.length,
        jobCategories: categories.length,
      },
    };
  },
});

