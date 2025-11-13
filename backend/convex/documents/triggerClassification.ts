import { v } from "convex/values";
import { api, internal } from "../_generated/api"; // Import api to run actions
import { Doc } from "../_generated/dataModel"; // Import Doc type for user
import { action } from "../_generated/server";

export const triggerClassification = action({
  args: {
    documentUploadId: v.id("documentUploads"),
    storageFileId: v.id("_storage"),
    mimeType: v.string(),
    fileName: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ success: boolean; classification: string; extractedText: string }> => {
    // Authenticate the user to ensure only authorized admins can trigger classification
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(api.users.index.getUserByClerkId, {
      clerkId: identity.subject,
    }) as Doc<"users"> | null; // Explicitly cast user type

    if (!user || user.role !== "admin") {
      // Only allow admins to trigger classification
      throw new Error("Not authorized to trigger document classification");
    }

    // Get the file URL from storage
    const fileUrl = await ctx.storage.getUrl(args.storageFileId);
    if (!fileUrl) {
      throw new Error("Could not get file URL for classification");
    }

    // Call the OCR service to extract text  
    const extractedText = await ctx.runAction(
      (api as any)["ocr/extractDocumentText"],
      {
        fileUrl: fileUrl,
      }
    );

    if (!extractedText) {
      throw new Error("Could not extract text from document");
    }

    // Simulate classification based on extracted text (for now, a simple placeholder)
    let classification: string = "Unclassified";
    if (extractedText.toLowerCase().includes("passport")) {
      classification = "Passport";
    } else if (extractedText.toLowerCase().includes("id card")) {
      classification = "ID Card";
    } else if (extractedText.toLowerCase().includes("birth certificate")) {
      classification = "Birth Certificate";
    }

    // Update the document with the extracted text and classification
    await ctx.runMutation(internal.documents.updateDocumentClassification as any, {
      documentUploadId: args.documentUploadId,
      extractedText: extractedText,
      classification: classification,
    });

    return { success: true, classification: classification, extractedText: extractedText };
  },
});
