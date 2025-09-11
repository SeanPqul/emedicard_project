import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createUserMutation = mutation({
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
