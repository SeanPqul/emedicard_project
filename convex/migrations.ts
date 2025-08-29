import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

// Seed job categories, document requirements, and their relationships
export const seedJobCategoriesAndRequirements = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting database seeding...");

    //Insert job categories
    const jobCategories = [
      { name: "Food Handler", colorCode: "#FFD700", requireOrientation: "Yes" },
      { name: "Non-Food Worker", colorCode: "#00FF00", requireOrientation: "No" },
      { name: "Skin-to-Skin Contact Worker", colorCode: "#FF69B4", requireOrientation: "No" },
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

    //Insert document requirements
    const documentRequirements = [
      { name: "Valid Government ID", fieldName: "validId", description: "Any valid government-issued ID", icon: "card-outline", required: true },
      { name: "2x2 ID Picture", fieldName: "picture", description: "Recent colored 2x2 ID picture", icon: "camera-outline", required: true },
      { name: "Chest X-ray", fieldName: "chestXrayId", description: "Recent chest X-ray result", icon: "medical-outline", required: true },
      { name: "Urinalysis", fieldName: "urinalysisId", description: "Complete urinalysis test", icon: "flask-outline", required: true },
      { name: "Stool Examination", fieldName: "stoolId", description: "Stool examination result", icon: "analytics-outline", required: true },
      { name: "Cedula", fieldName: "cedulaId", description: "Community Tax Certificate", icon: "document-text-outline", required: true },
      { name: "Drug Test", fieldName: "drugTestId", description: "Drug test result (for Security Guards)", icon: "shield-outline", required: false },
      { name: "Neuropsychiatric Test", fieldName: "neuroExamId", description: "Neuropsychiatric evaluation (for Security Guards)", icon: "medical-outline", required: false },
      { name: "Hepatitis B Antibody Test", fieldName: "hepatitisBId", description: "Hepatitis B surface antibody test result", icon: "shield-checkmark-outline", required: false },
    ];

    const documentIds: Record<string, Id<"documentTypes">> = {};
    for (const doc of documentRequirements) {
      const existing = await ctx.db
        .query("documentTypes")
        .withIndex("by_field_identifier", (q) => q.eq("fieldIdentifier", doc.fieldName))
        .first();

      if (existing) {
        documentIds[doc.name] = existing._id;
      } else {
        const id = await ctx.db.insert("documentTypes", {name: doc.name, description: doc.description, icon: doc.icon, isRequired: doc.required, fieldIdentifier: doc.fieldName});
        documentIds[doc.name] = id;
      }
    }

    //Link documents to categories
    const categoryRequirementMap: Record<string, { name: string; required: boolean }[]> = {
      "Food Handler": [
        { name: "Valid Government ID", required: true },
        { name: "2x2 ID Picture", required: true },
        { name: "Chest X-ray", required: true },
        { name: "Urinalysis", required: true },
        { name: "Stool Examination", required: true },
        { name: "Cedula", required: true },
      ],
      "Non-Food Worker": [
        { name: "Valid Government ID", required: true },
        { name: "2x2 ID Picture", required: true },
        { name: "Chest X-ray", required: true },
        { name: "Urinalysis", required: true },
        { name: "Stool Examination", required: true },
        { name: "Cedula", required: true },
        { name: "Drug Test", required: false },
        { name: "Neuropsychiatric Test", required: false },
      ],
      "Skin-to-Skin Contact Worker": [
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
      for (const req of reqList) {
        const documentRequirementId = documentIds[req.name];

        // Check if link already exists
        const existing = await ctx.db
          .query("jobCategoryDocuments")
          .withIndex("by_job_category", (q) => q.eq("jobCategoryId", jobCategoryId))
          .collect();

        const alreadyLinked = existing.some((e) => e.documentTypeId === documentRequirementId);
        if (!alreadyLinked) {
          await ctx.db.insert("jobCategoryDocuments", {
            jobCategoryId,
            documentTypeId: documentRequirementId,
            isRequired: req.required,
          });
          linkedCount++;
        }
      }
    }

    return {
      message: "✅ Database seed complete",
      categoriesCreated: jobCategories.length,
      documentRequirementsCreated: Object.keys(documentIds).length,
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

