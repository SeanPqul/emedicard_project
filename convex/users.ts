import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createUser = mutation({
    args: {
        username: v.string(),
        fullname: v.string(),
        email: v.string(),
        image: v.string(),
        gender: v.optional(v.string()),
        birthDate: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
        clerkId: v.string()
    },
    handler: async(ctx, args) => {

        const existingUser = await ctx.db.query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first()

        if (existingUser) return
        
        //create user in db
        await ctx.db.insert("users", {
            ...args
        });
    }
});