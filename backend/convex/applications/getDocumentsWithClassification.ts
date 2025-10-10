import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { action } from "../_generated/server"; // Import QueryCtx

// Define the expected structure of a checklist item from getWithDocuments query
type DocumentChecklistItem = {
  _id: Id<"jobCategoryDocuments">;
  requirementName: string;
  isRequired: boolean;
  status: string;
  fileUrl: string | null;
  uploadId: Id<"documentUploads"> | null | undefined;
  remarks: string | null | undefined;
};

// Define the expected structure of a checklist item with classification data
type ChecklistItemWithClassification = DocumentChecklistItem & {
  classificationData: any; // Adjust type as needed for actual classification results
};

export const get = action({
  args: { id: v.id("applications") },
  handler: async (
    ctx,
    args
  ): Promise<{
    applicantName: string;
    jobCategoryName: string;
    checklist: ChecklistItemWithClassification[];
  } | null> => {
    // 1. Call the existing query to get application data and document checklist
    const applicationData = await ctx.runQuery(api.applications.getWithDocuments.get, { id: args.id });

    if (!applicationData) {
      return null;
    }

    // 2. Iterate through the checklist and call the classification action for each document
    const checklistWithClassification = await Promise.all(
      applicationData.checklist.map(async (item: DocumentChecklistItem) => { // Explicitly type item
        let classificationData = null;

        if (item.uploadId && item.fileUrl) {
          try {
            // Fetch the documentUploads record to get the fileType
            const userUpload = await ctx.runQuery(api.documentUploads.get.get, { id: item.uploadId });

            if (userUpload && userUpload.fileType) {
              classificationData = await ctx.runAction(api.documents.classifyDocument.classify, { // Corrected path
                storageFileId: userUpload.storageFileId,
                mimeType: userUpload.fileType,
              });
            } else {
              console.warn(`Document upload ${item.uploadId} missing fileType or not found.`);
              classificationData = { error: "File type missing or document not found for classification." };
            }
          } catch (error: any) {
            console.error(`Error classifying document ${item.uploadId}:`, error);
            classificationData = { error: error.message || "Failed to classify document." };
          }
        }

        return {
          ...item,
          classificationData: classificationData,
        };
      })
    );

    return {
      applicantName: applicationData.applicantName,
      jobCategoryName: applicationData.jobCategoryName,
      checklist: checklistWithClassification,
    };
  },
});
