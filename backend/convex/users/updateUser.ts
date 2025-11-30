"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";
import { api } from "../_generated/api";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Main action that syncs with both Clerk and database
export const updateUserMutation = action({
    args: {
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        fullname: v.optional(v.string()),
        username: v.optional(v.string()),
        gender: v.optional(v.string()),
        birthDate: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
        // Registration fields
        registrationStatus: v.optional(v.string()),
        registrationDocumentId: v.optional(v.string()),
        registrationSubmittedAt: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<any> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Get current user from database
        const user: any = await ctx.runQuery(api.users.getCurrentUser.getCurrentUserQuery, {});
        if (!user) {
            throw new Error("User not found");
        }

        // Step 1: Update Clerk Backend API (works for ALL auth types including OAuth)
        try {
            const clerkUpdateData: { firstName?: string; lastName?: string; username?: string } = {};
            
            if (args.firstName) clerkUpdateData.firstName = args.firstName;
            if (args.lastName) clerkUpdateData.lastName = args.lastName;
            if (args.username) clerkUpdateData.username = args.username;

            // Only update Clerk if we have name/username changes
            if (Object.keys(clerkUpdateData).length > 0) {
                await clerk.users.updateUser(identity.subject, clerkUpdateData);
            }
        } catch (clerkError: any) {
            console.error("Failed to update Clerk:", clerkError);
             // If we are just updating registration data, we can proceed
             if (!args.registrationStatus) {
               throw new Error("Failed to sync profile with authentication provider: " + (clerkError.message || "Unknown error"));
            }
        }

        // Step 2: Update Convex database
        const dbUpdates: Record<string, any> = {};
        
        if (args.firstName && args.lastName) {
            dbUpdates.fullname = `${args.firstName} ${args.lastName}`.trim();
        } else if (args.fullname) {
            dbUpdates.fullname = args.fullname;
        }
        
        // Add other optional fields
        if (args.username !== undefined) dbUpdates.username = args.username;
        if (args.gender !== undefined) dbUpdates.gender = args.gender;
        if (args.birthDate !== undefined) dbUpdates.birthDate = args.birthDate;
        if (args.phoneNumber !== undefined) dbUpdates.phoneNumber = args.phoneNumber;
        
        // Registration fields
        if (args.registrationStatus !== undefined) dbUpdates.registrationStatus = args.registrationStatus;
        if (args.registrationDocumentId !== undefined) dbUpdates.registrationDocumentId = args.registrationDocumentId;
        if (args.registrationSubmittedAt !== undefined) dbUpdates.registrationSubmittedAt = args.registrationSubmittedAt;

        await ctx.runMutation(api.users.updateUserDb.updateUserDatabase, {
            userId: user._id,
            updates: dbUpdates,
        });
        
        return user._id;
    }
});
