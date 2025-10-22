import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { action } from "../_generated/server";

// Define the expected structure of a checklist item from getWithDocuments query
type DocumentChecklistItem = {
  _id: Id<"jobCategoryDocuments">;
  requirementName: string;
  isRequired: boolean;
  status: string;
  fileUrl: string | null;
  uploadId: Id<"documentUploads"> | null | undefined;
  remarks: string | null | undefined;
  extractedText: string | null | undefined; // Add extractedText property
};

// Define the expected structure of a checklist item with classification data
type ChecklistItemWithClassification = DocumentChecklistItem;

type GetDocumentsResult = {
  applicantName: string;
  jobCategoryName: string;
  checklist: ChecklistItemWithClassification[];
} | null;

export const get = action({
    args: { id: v.id("applications") },
    handler: async (ctx, args): Promise<GetDocumentsResult> => {
      // 1. Call the existing query to get application data and document checklist
      // @ts-ignore - Type instantiation depth limitation
      const applicationData = await ctx.runQuery(api.applications.getWithDocuments.get, { id: args.id });

      if (!applicationData) {
        return null;
      }

      // 2. Return checklist with classification data
      const checklistWithClassification = applicationData.checklist.map((item: DocumentChecklistItem) => ({
        ...item,
        extractedText: item.extractedText, // Ensure extractedText is passed through
      }));

      return {
        applicantName: applicationData.applicantName,
        jobCategoryName: applicationData.jobCategoryName,
        checklist: checklistWithClassification,
      };
    },
  });
