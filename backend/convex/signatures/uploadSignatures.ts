import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Generate an upload URL for signature images
 * This is a helper mutation to upload signature files to Convex storage
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Generate upload URL for signature file
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Store signature metadata after upload
 * Call this after uploading the file to save the storageId to database
 */
export const storeSignature = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.union(v.literal("doctor"), v.literal("sanitation_chief")),
  },
  handler: async (ctx, args) => {
    console.log(`✅ Signature uploaded successfully!`);
    console.log(`   Name: ${args.name}`);
    console.log(`   Type: ${args.type}`);
    console.log(`   Storage ID: ${args.storageId}`);
    
    // Check if signature of this type already exists
    const existingSignature = await ctx.db
      .query("signatures")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .first();
    
    if (existingSignature) {
      // Update existing signature
      await ctx.db.patch(existingSignature._id, {
        storageId: args.storageId,
        name: args.name,
        uploadedAt: Date.now(),
      });
      console.log(`   Updated existing ${args.type} signature`);
    } else {
      // Insert new signature record
      await ctx.db.insert("signatures", {
        storageId: args.storageId,
        name: args.name,
        type: args.type,
        uploadedAt: Date.now(),
      });
      console.log(`   Created new ${args.type} signature record`);
    }
    
    // Return the storage ID and URL for reference
    return {
      storageId: args.storageId,
      name: args.name,
      type: args.type,
      url: await ctx.storage.getUrl(args.storageId),
    };
  },
});
