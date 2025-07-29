import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createUser = mutation({
    args: {
        username: v.string(),
        fullname: v.string(),
        email: v.string(),
        image: v.string(),
        gender: v.optional(v.string()),
        birthDate: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
        role: v.optional(v.union(
            v.literal("applicant"),
            v.literal("inspector"),
        )),
        clerkId: v.string()
    },
    handler: async(ctx, args) => {

        const existingUser = await ctx.db.query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first()

        if (existingUser) return
        
        //create user in db with default role as 'applicant'
        await ctx.db.insert("users", {
            ...args,
            role: args.role || "applicant"
        });
    }
});

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        return user;
    }
});

export const updateUser = mutation({
    args: {
        fullname: v.optional(v.string()),
        username: v.optional(v.string()),
        gender: v.optional(v.string()),
        birthDate: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Filter out undefined values
        const updates = Object.fromEntries(
            Object.entries(args).filter(([_, value]) => value !== undefined)
        );

        await ctx.db.patch(user._id, updates);
        return user._id;
    }
});

// Admin function to update user roles
export const updateUserRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.union(
            v.literal("applicant"),
            v.literal("inspector"),
        )
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Check if current user is admin
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        throw new Error("Unauthorized: Operation not allowed");

        await ctx.db.patch(args.userId, { role: args.role });
        return args.userId;
    }
});

// Query to get users by role (admin only)
export const getUsersByRole = query({
    args: {
        role: v.optional(v.union(
            v.literal("applicant"),
            v.literal("inspector"),
        ))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Check if current user is admin
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        throw new Error("Unauthorized: Operation not allowed");

        if (args.role) {
            return await ctx.db
                .query("users")
                .withIndex("by_role", (q) => q.eq("role", args.role))
                .collect();
        } else {
            return await ctx.db.query("users").collect();
        }
    }
});
