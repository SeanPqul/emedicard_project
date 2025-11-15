import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { action } from "../_generated/server";

// Define the expected structure of a checklist item from getWithDocuments query
type DocumentChecklistItem = {
  _id: Id<"jobCategoryDocuments">;
  documentTypeId: Id<"documentTypes">; // Actual document type ID (for referral queries)
  requirementName: string;
  isRequired: boolean;
  status: string;
  fileUrl: string | null;
  uploadId: Id<"documentUploads"> | null | undefined;
  remarks: string | null | undefined;
  extractedText: string | null | undefined; // Add extractedText property
  fieldIdentifier?: string; // Field identifier to match with test types
};

// Define the expected structure of a checklist item with classification data
type ChecklistItemWithClassification = DocumentChecklistItem & {
  hasLabFinding?: boolean; // NEW: Indicates if lab finding has been recorded
};

type ApplicantDetails = {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  email?: string;
  age?: number;
  gender?: string;
  nationality?: string;
  civilStatus?: string;
  organization?: string;
  position?: string;
  securityGuard?: boolean;
};

type GetDocumentsResult = {
  applicantName: string;
  jobCategoryName: string;
  checklist: ChecklistItemWithClassification[];
  applicantDetails?: ApplicantDetails;
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

      // 2. Fetch lab findings for this application
      // @ts-ignore - Type check limitation
      const labFindings = await ctx.runQuery(api.labFindings.index.getLabFindings, { applicationId: args.id });

      // 3. Map document field identifiers to lab finding test types
      const documentToTestType: Record<string, "urinalysis" | "xray_sputum" | "stool"> = {
        "urinalysisId": "urinalysis",
        "chestXrayId": "xray_sputum",
        "stoolId": "stool",
      };

      // 4. Return checklist with classification data and lab findings indicator
      const checklistWithClassification = applicationData.checklist.map((item: DocumentChecklistItem) => {
        // Check if this specific document has a lab finding
        let hasLabFinding = false;
        if (item.fieldIdentifier && documentToTestType[item.fieldIdentifier]) {
          const testType = documentToTestType[item.fieldIdentifier];
          hasLabFinding = labFindings?.[testType]?.length > 0;
        }

        return {
          ...item,
          extractedText: item.extractedText, // Ensure extractedText is passed through
          hasLabFinding, // Add lab findings indicator for THIS specific document
        };
      });

      return {
        applicantName: applicationData.applicantName,
        jobCategoryName: applicationData.jobCategoryName,
        checklist: checklistWithClassification,
        applicantDetails: applicationData.applicantDetails,
      };
    },
  });
