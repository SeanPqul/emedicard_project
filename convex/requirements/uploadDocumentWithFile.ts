import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

// Centralized document upload action that handles the entire process
export const uploadDocumentWithFileAction = action({
  args: {
    applicationId: v.id("applications"),
    fieldIdentifier: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    fileBase64: v.string(), // Base64 encoded file content
    reviewStatus: v.optional(v.union(v.literal("Pending"), v.literal("Approved"), v.literal("Rejected"))),
    adminRemarks: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    storageId: Id<"_storage">;
    documentId: Id<"documentTypes">;
    message: string;
  }> => {
    // Step 1: Generate upload URL
    const uploadUrl: string = await ctx.runMutation(api.storage.generateUploadUrl.generateUploadUrlMutation);
    
    // Step 2: Convert base64 to blob and upload to storage
    const fileBuffer = Buffer.from(args.fileBase64, 'base64');
    
    const uploadResponse: Response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': args.fileType,
        'Content-Length': fileBuffer.length.toString(),
      },
      body: fileBuffer,
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file to storage: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }
    
    const { storageId }: { storageId: Id<"_storage"> } = await uploadResponse.json();
    
    // Step 3: Create document record with the real storage ID
    const result = await ctx.runMutation(api.requirements.uploadDocuments.uploadDocumentsMutation, {
      applicationId: args.applicationId,
      fieldIdentifier: args.fieldIdentifier,
      storageId: storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      reviewStatus: args.reviewStatus || "Pending",
      adminRemarks: args.adminRemarks,
    });
    
    return {
      success: true,
      storageId,
      documentId: result.requirementId,
      message: `Document ${args.fileName} uploaded successfully`,
    };
  },
});