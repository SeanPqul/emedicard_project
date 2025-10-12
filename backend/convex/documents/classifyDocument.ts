'use node';

import axios from 'axios';
import { v } from "convex/values";
import { api } from "../_generated/api"; // Import api to run mutations
import { action } from "../_generated/server";
// No explicit import for FormData, assuming native Node.js FormData is available

// Helper function to determine document type based on Extractous response
function determineDocumentTypeFromExtractous(extractousData: any): string {
  // This is a placeholder. You'll need to inspect the actual structure
  // of the Extractous response to accurately determine the document type.
  // For example, if Extractous returns a 'document_type' field:
  if (extractousData && extractousData.document_type) {
    return extractousData.document_type;
  }
  // Or if it returns a list of entities and you can infer from there
  if (extractousData && extractousData.entities && extractousData.entities.length > 0) {
    // Example: Look for a common entity type
    const entityTypes = extractousData.entities.map((e: any) => e.type?.toLowerCase());
    if (entityTypes.includes("driver_license")) return "Driver's License";
    if (entityTypes.includes("passport")) return "Passport";
    // Add more logic based on Extractous output
  }
  return "Unknown";
}

export const classify = action({
  args: {
    documentUploadId: v.id("documentUploads"), // New: ID of the documentUploads entry to update
    storageFileId: v.id("_storage"),
    mimeType: v.string(),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const EXTRACTOUS_API_KEY = process.env.EXTRACTOUS_API_KEY;
    if (!EXTRACTOUS_API_KEY) {
      console.error("EXTRACTOUS_API_KEY environment variable is not set.");
      // Update documentUploads with an error status if API key is missing
      await ctx.runMutation(api.documentUploads.updateDocumentClassification.updateDocumentClassification, {
        documentUploadId: args.documentUploadId,
        classifiedDocumentType: "Classification Failed",
        extractousResponse: { error: "EXTRACTOUS_API_KEY is not set." },
      });
      return; // Exit early
    }

    const file = await ctx.storage.get(args.storageFileId);
    if (!file) {
      console.error("File not found in Convex storage for classification.");
      await ctx.runMutation(api.documentUploads.updateDocumentClassification.updateDocumentClassification, {
        documentUploadId: args.documentUploadId,
        classifiedDocumentType: "Classification Failed",
        extractousResponse: { error: "File not found in Convex storage." },
      });
      return; // Exit early
    }

    const fileBuffer = await file.arrayBuffer();
    const formData = new FormData(); // Use native FormData
    formData.append('file', new Blob([fileBuffer], { type: args.mimeType }), args.fileName); // Append Blob for native FormData
    formData.append('config', JSON.stringify({ strategy: 'FAST_WITH_OCR' }));

    let classifiedDocumentType: string = "Unknown";
    let extractousResponse: any = null;

    try {
      const response = await axios.post('https://api.extractous.com/v1/extract', formData, {
        headers: {
          'X-Api-Key': EXTRACTOUS_API_KEY,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      extractousResponse = response.data;
      classifiedDocumentType = determineDocumentTypeFromExtractous(extractousResponse);

      console.log("Document classified by Extractous:", classifiedDocumentType);

    } catch (error: any) {
      console.error("Error classifying document with Extractous:", error.response?.data || error.message);
      classifiedDocumentType = "Classification Failed";
      extractousResponse = { error: error.response?.data || error.message };
    }

    // Update the documentUploads entry with the classification results
    await ctx.runMutation(api.documentUploads.updateDocumentClassification.updateDocumentClassification, {
      documentUploadId: args.documentUploadId,
      classifiedDocumentType: classifiedDocumentType,
      extractousResponse: extractousResponse,
    });
  },
});
