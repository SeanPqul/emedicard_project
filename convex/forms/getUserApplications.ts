import { query } from "../_generated/server";

export const getUserApplications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      // Return empty array if user doesn't exist in database yet
      return [];
    }

    // Get forms directly instead of through applicationForms
    const forms = await ctx.db
      .query("forms")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const formsWithDetails = await Promise.all(
      forms.map(async (form) => {
        const jobCategory = await ctx.db.get(form.jobCategory);
        
        // Get document count for this form
        const documents = await ctx.db
          .query("formDocuments")
          .withIndex("by_form", (q) => q.eq("formId", form._id))
          .collect();
        
        return {
          ...form,
          jobCategory,
          documentCount: documents.length,
          submittedAt: form.status !== "Submitted" ? undefined : form.updatedAt || form._creationTime,
        };
      })
    );

    return formsWithDetails;
  },
});
