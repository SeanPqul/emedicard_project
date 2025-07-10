import { mutation } from "./_generated/server";

export const seedJobCategoriesAndRequirements = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if job categories already exist
    const existingCategories = await ctx.db.query("jobCategory").collect();
    
    if (existingCategories.length > 0) {
      console.log("Job categories already exist. Skipping seed.");
      return { message: "Job categories already exist" };
    }

    // Create the 3 correct health card types
    const jobCategories = [
      {
        name: "Food Handler",
        colorCode: "#FFD700", // Yellow
        requireOrientation: "Yes"
      },
      {
        name: "General Worker", 
        colorCode: "#008000", // Green - for BPO/Mall/Security/General jobs
        requireOrientation: "No"
      },
      {
        name: "Skin-to-Skin Contact",
        colorCode: "#FF69B4", // Pink - for massage, tattoo artist, etc.
        requireOrientation: "No"
      }
    ];

    // Insert job categories
    const categoryIds = [];
    for (const category of jobCategories) {
      const categoryId = await ctx.db.insert("jobCategory", category);
      categoryIds.push(categoryId);
      console.log(`Created job category: ${category.name}`);
    }

    // Create requirements for each job category
    const requirementsData = [
      // Food Handler (Yellow Card) Requirements
      {
        jobCategoryId: categoryIds[0],
        name: "Valid Government ID",
        description: "Any valid government-issued ID (Driver's License, Passport, etc.)",
        icon: "card-outline",
        required: true,
        fieldName: "validId"
      },
      {
        jobCategoryId: categoryIds[0],
        name: "2x2 ID Picture",
        description: "Recent colored 2x2 ID picture with white background",
        icon: "camera-outline",
        required: true,
        fieldName: "picture"
      },
      {
        jobCategoryId: categoryIds[0],
        name: "Chest X-ray",
        description: "Recent chest X-ray result (not older than 6 months)",
        icon: "medical-outline",
        required: true,
        fieldName: "chestXrayId"
      },
      {
        jobCategoryId: categoryIds[0],
        name: "Urinalysis",
        description: "Complete urinalysis test result",
        icon: "flask-outline",
        required: true,
        fieldName: "urinalysisId"
      },
      {
        jobCategoryId: categoryIds[0],
        name: "Stool Examination",
        description: "Stool examination for parasites and bacteria",
        icon: "analytics-outline",
        required: true,
        fieldName: "stoolId"
      },
      {
        jobCategoryId: categoryIds[0],
        name: "Cedula",
        description: "Community Tax Certificate (Cedula)",
        icon: "document-text-outline",
        required: true,
        fieldName: "cedulaId"
      },
      
      // General Worker (Green Card) Requirements
      {
        jobCategoryId: categoryIds[1],
        name: "Valid Government ID",
        description: "Any valid government-issued ID (Driver's License, Passport, etc.)",
        icon: "card-outline",
        required: true,
        fieldName: "validId"
      },
      {
        jobCategoryId: categoryIds[1],
        name: "2x2 ID Picture",
        description: "Recent colored 2x2 ID picture with white background",
        icon: "camera-outline",
        required: true,
        fieldName: "picture"
      },
      {
        jobCategoryId: categoryIds[1],
        name: "Chest X-ray",
        description: "Recent chest X-ray result (not older than 6 months)",
        icon: "medical-outline",
        required: true,
        fieldName: "chestXrayId"
      },
      {
        jobCategoryId: categoryIds[1],
        name: "Urinalysis",
        description: "Complete urinalysis test result",
        icon: "flask-outline",
        required: true,
        fieldName: "urinalysisId"
      },
      {
        jobCategoryId: categoryIds[1],
        name: "Stool Examination",
        description: "Stool examination for parasites and bacteria",
        icon: "analytics-outline",
        required: true,
        fieldName: "stoolId"
      },
      {
        jobCategoryId: categoryIds[1],
        name: "Cedula",
        description: "Community Tax Certificate (Cedula)",
        icon: "document-text-outline",
        required: true,
        fieldName: "cedulaId"
      },
      {
        jobCategoryId: categoryIds[1],
        name: "Drug Test",
        description: "Drug test result (Required for Security Guards)",
        icon: "shield-outline",
        required: false,
        fieldName: "drugTestId"
      },
      {
        jobCategoryId: categoryIds[1],
        name: "Neuropsychiatric Test",
        description: "Neuropsychiatric evaluation (Required for Security Guards)",
        icon: "brain-outline",
        required: false,
        fieldName: "neuroExamId"
      },
      
      // Skin-to-Skin Contact (Pink Card) Requirements
      {
        jobCategoryId: categoryIds[2],
        name: "Valid Government ID",
        description: "Any valid government-issued ID (Driver's License, Passport, etc.)",
        icon: "card-outline",
        required: true,
        fieldName: "validId"
      },
      {
        jobCategoryId: categoryIds[2],
        name: "2x2 ID Picture",
        description: "Recent colored 2x2 ID picture with white background",
        icon: "camera-outline",
        required: true,
        fieldName: "picture"
      },
      {
        jobCategoryId: categoryIds[2],
        name: "Chest X-ray",
        description: "Recent chest X-ray result (not older than 6 months)",
        icon: "medical-outline",
        required: true,
        fieldName: "chestXrayId"
      },
      {
        jobCategoryId: categoryIds[2],
        name: "Urinalysis",
        description: "Complete urinalysis test result",
        icon: "flask-outline",
        required: true,
        fieldName: "urinalysisId"
      },
      {
        jobCategoryId: categoryIds[2],
        name: "Stool Examination",
        description: "Stool examination for parasites and bacteria",
        icon: "analytics-outline",
        required: true,
        fieldName: "stoolId"
      },
      {
        jobCategoryId: categoryIds[2],
        name: "Cedula",
        description: "Community Tax Certificate (Cedula)",
        icon: "document-text-outline",
        required: true,
        fieldName: "cedulaId"
      },
      {
        jobCategoryId: categoryIds[2],
        name: "Hepatitis B Antibody Test",
        description: "Hepatitis B surface antibody test result",
        icon: "shield-checkmark-outline",
        required: true,
        fieldName: "hepatitisBId"
      }
    ];

    // Insert requirements
    const requirementIds = [];
    for (const requirement of requirementsData) {
      const requirementId = await ctx.db.insert("documentRequirements", requirement);
      requirementIds.push(requirementId);
    }

    console.log(`Created ${requirementIds.length} document requirements`);

    return { 
      message: "Job categories and requirements seeded successfully",
      categories: categoryIds,
      requirements: requirementIds
    };
  },
});
