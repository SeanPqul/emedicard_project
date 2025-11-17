// convex/admin/cleanupOldUploads.ts
import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Delete old/duplicate document uploads for an application
 * Keeps only the latest upload per document type
 */
export const cleanupOldUploads = internalMutation({
  args: {
    // Accept string for easier CLI usage; we'll cast to any internally
    applicationId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`\n====================================`);
    console.log(`CLEANING UP OLD DOCUMENT UPLOADS`);
    console.log(`====================================`);
    console.log(`Application ID: ${args.applicationId}\n`);

    // Get all uploads for this application
    const allUploads = await ctx.db
      .query("documentUploads")
      .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId as any))
      .collect();

    console.log(`Found ${allUploads.length} total uploads`);

    // Group by document type
    const uploadsByType = new Map<string, typeof allUploads>();
    for (const upload of allUploads) {
      const typeId = upload.documentTypeId;
      if (!uploadsByType.has(typeId)) {
        uploadsByType.set(typeId, []);
      }
      uploadsByType.get(typeId)!.push(upload);
    }

    let deletedCount = 0;
    let keptCount = 0;

    // For each document type, keep only the latest upload
    for (const [typeId, uploads] of uploadsByType) {
      const docType: any = await ctx.db.get(typeId as any);
      console.log(`\n📄 ${docType?.name || "Unknown"}: ${uploads.length} uploads`);

      // Sort by uploadedAt descending (newest first)
      uploads.sort((a, b) => b.uploadedAt - a.uploadedAt);

      // Keep the first one (newest), delete the rest
      for (let i = 0; i < uploads.length; i++) {
        if (i === 0) {
          console.log(`   ✅ KEEPING: ${uploads[i]!._id} (Status: ${uploads[i]!.reviewStatus}, Uploaded: ${new Date(uploads[i]!.uploadedAt).toLocaleString()})`);
          keptCount++;
        } else {
          console.log(`   ❌ DELETING: ${uploads[i]!._id} (Status: ${uploads[i]!.reviewStatus}, Uploaded: ${new Date(uploads[i]!.uploadedAt).toLocaleString()})`);
          await ctx.db.delete(uploads[i]!._id);
          deletedCount++;
        }
      }
    }

    console.log(`\n====================================`);
    console.log(`CLEANUP COMPLETE`);
    console.log(`====================================`);
    console.log(`Kept: ${keptCount} documents`);
    console.log(`Deleted: ${deletedCount} old/duplicate uploads`);
    console.log(`====================================\n`);

    return {
      success: true,
      keptCount,
      deletedCount,
    };
  },
});
