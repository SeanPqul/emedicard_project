import type { QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";

export const getApplicants = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to getApplicants");
    }

    // Optional: Add authorization check if only certain roles can view applicants
    // const currentUser = await ctx.db
    //   .query("users")
    //   .withIndex("by_clerk_id", (q) =>
    //     q.eq("clerkId", identity.subject)
    //   )
    //   .first();

    // if (currentUser?.role !== "admin" && currentUser?.role !== "inspector") {
    //   throw new Error("Unauthorized: Only admins and inspectors can view applicants.");
    // }

    const applicants = await ctx.db
      .query("users")
      .withIndex("by_role", (q: any) => q.eq("role", "applicant"))
      .collect();
    
    return applicants.filter(user => !user.deletedAt);
  },
});
