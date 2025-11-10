import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const issueHealthCardMutation = mutation({
  args: {
    applicationId: v.id("applications"),
    registrationNumber: v.string(),
    htmlContent: v.string(),
    issuedDate: v.number(),
    expiryDate: v.number(),
  },
  handler: async (ctx, args) => {
    const healthCardId = await ctx.db.insert("healthCards", {
      applicationId: args.applicationId,
      registrationNumber: args.registrationNumber,
      htmlContent: args.htmlContent,
      issuedDate: args.issuedDate,
      expiryDate: args.expiryDate,
      status: "active",
      createdAt: Date.now(),
    });

    return healthCardId;
  },
});
