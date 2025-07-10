import { mutation } from "./_generated/server";

export const seedJobCategories = mutation({
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

    return { 
      message: "Job categories seeded successfully",
      categories: categoryIds
    };
  },
});

export const seedRequirements = mutation({
  args: {},
  handler: async (ctx) => {
    // This will be used to populate document requirements for each job category
    // For now, we'll just create the job categories
    return { message: "Requirements seeding not implemented yet" };
  },
});
