import { query } from "../_generated/server";

export const getCategoryRequirements = query({
  args: {},
  handler: async (ctx) => {
    // Fetch all job categories
    const jobCategories = await ctx.db.query("jobCategory").collect();

    // Fetch all document requirements
    const documentRequirements = await ctx.db.query("documentRequirements").collect();

    // Fetch all category-to-document links
    const jobCategoryRequirements = await ctx.db.query("jobCategoryRequirements").collect();

    const docMap = Object.fromEntries(
      documentRequirements.map(doc => [doc._id, doc])
    );

    const result = jobCategories.map(category => {
      const requirements = jobCategoryRequirements
        .filter(link => link.jobCategoryId === category._id)
        .map(link => ({
          ...docMap[link.documentRequirementId],
          required: link.required
        }));

      return {
        category: category.name,
        requirements
      };
    });

    return result;
  }
});
