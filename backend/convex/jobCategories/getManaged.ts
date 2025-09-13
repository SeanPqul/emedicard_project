import { query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { AdminRole } from "../users/roles"; // Import AdminRole

export const get = query({
  handler: async (ctx) => {
    const adminPrivileges = await AdminRole(ctx);

    if (!adminPrivileges.isAdmin) {
      return []; // Non-admin users or users without admin privileges manage no categories
    }

    if (adminPrivileges.managedCategories === "all") {
      // If "all", return all job categories
      return await ctx.db.query("jobCategories").collect();
    } else if (adminPrivileges.managedCategories && adminPrivileges.managedCategories.length > 0) {
      // If specific categories are managed, fetch them
      const managedCategoryIds = adminPrivileges.managedCategories as Id<"jobCategories">[];
      const categories: Doc<"jobCategories">[] = [];
      for (const categoryId of managedCategoryIds) {
        const category = await ctx.db.get(categoryId) as Doc<"jobCategories"> | null;
        if (category) {
          categories.push(category);
        }
      }
      return categories;
    }

    return []; // Default case, no categories managed
  },
});
