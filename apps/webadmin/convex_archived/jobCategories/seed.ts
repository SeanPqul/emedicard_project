import { mutation } from "../_generated/server";

export const seedJobCategories = mutation({
  handler: async (ctx) => {
    const categories = [
      { name: "Yellow Card", colorCode: "#FFC107" },
      { name: "Green Card", colorCode: "#4CAF50" },
      { name: "Pink Card", colorCode: "#E91E63" },
    ];

    for (const category of categories) {
      await ctx.db.insert("jobCategories", category);
    }

    return { success: true };
  },
});
