// Extended user management functions from webadmin
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { internalMutation, mutation, query } from "../_generated/server";

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

// =================================================================
// == 4. FOR SUPER ADMIN ACTIONS (INTERNAL QUERY/MUTATIONS) ==
// =================================================================

// Query to get a user by Clerk ID (used by actions)
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Mutation to patch user role and managed categories (used by actions)
export const patchUserRoleAndCategories = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("applicant"),
      v.literal("inspector"),
      v.literal("admin"),
      v.literal("system_admin"),
    ),
    managedCategories: v.array(v.id("jobCategories")),
    username: v.optional(v.string()),
    gender: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {
      role: args.role,
      managedCategories: args.managedCategories,
    };

    if (args.username !== undefined) updates.username = args.username;
    if (args.gender !== undefined) updates.gender = args.gender;
    if (args.birthDate !== undefined) updates.birthDate = args.birthDate;
    if (args.phoneNumber !== undefined) updates.phoneNumber = args.phoneNumber;

    await ctx.db.patch(args.userId, updates);
  },
});

// Mutation to insert a new user (used by actions)
export const systemCreateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    fullname: v.string(),
    image: v.string(),
    role: v.union(
      v.literal("applicant"),
      v.literal("inspector"),
      v.literal("admin"),
      v.literal("system_admin"),
    ),
    managedCategories: v.array(v.id("jobCategories")),
    username: v.string(),
    gender: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Doc<"users">["_id"]> => {
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      fullname: args.fullname,
      image: args.image,
      role: args.role,
      managedCategories: args.managedCategories,
      username: args.username,
      gender: args.gender,
      birthDate: args.birthDate,
      phoneNumber: args.phoneNumber,
    });
  },
});
