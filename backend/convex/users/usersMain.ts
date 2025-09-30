// Extended user management functions from webadmin
import { v } from "convex/values";
import { query, mutation, internalMutation } from "../_generated/server";

// =================================================================
// == 1. FOR THE SECURE CLERK WEBHOOK (INTERNAL) ==
// =================================================================
export const internalCreateOrUpdateUser = internalMutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        fullname: v.string(),
        image: v.string(),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId)).unique();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, { email: args.email, fullname: args.fullname, image: args.image });
            return;
        }

        await ctx.db.insert("users", {
            username: args.email.split('@')[0] || "user",
            fullname: args.fullname,
            email: args.email,
            image: args.image,
            clerkId: args.clerkId,
            role: "applicant", // New users always start as applicants
        });
    },
});

// =================================================================
// == 2. FOR THE CLIENT-SIDE FIRST LOGIN (PUBLIC MUTATION) ==
// =================================================================
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication failed.");

    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();

    if (user !== null) return user._id;

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email!,
      fullname: identity.name!,
      image: identity.pictureUrl!,
      username: identity.email!.split("@")[0] || "user",
      role: "applicant", // New users always start as applicants
    });
  },
});

// =================================================================
// == 3. FOR FETCHING CURRENT USER DATA (PUBLIC QUERY) ==
// =================================================================
export const getCurrentUserAlternative = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null; // Not logged in
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});