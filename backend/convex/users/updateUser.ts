import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const updateUserMutation = mutation({
    args: {
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
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

        // Construct fullname from firstName, lastName if provided
        let updates: Record<string, string> = {};
        
        if (args.firstName && args.lastName) {
            updates.fullname = `${args.firstName} ${args.lastName}`.trim();
        } else if (args.fullname) {
            updates.fullname = args.fullname;
        }
        
        // Add other optional fields
        if (args.username !== undefined) updates.username = args.username;
        if (args.gender !== undefined) updates.gender = args.gender;
        if (args.birthDate !== undefined) updates.birthDate = args.birthDate;
        if (args.phoneNumber !== undefined) updates.phoneNumber = args.phoneNumber;

        await ctx.db.patch(user._id, updates);
        return user._id;
    }
});
