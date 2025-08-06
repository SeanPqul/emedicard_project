import { query } from "../_generated/server";

export const getUserPayments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Return empty if not authenticated
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return []; // Return empty if user does not exist in DB yet
    }

    const userForms = await ctx.db
      .query("forms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (userForms.length === 0) {
      return [];
    }

    const formIds = userForms.map((form) => form._id);

    const payments = await Promise.all(
      formIds.map(async (formId) => {
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_form", (q) => q.eq("formId", formId))
          .unique();
        return payment;
      })
    );

    return payments.filter(Boolean) as any[];
  },
});
