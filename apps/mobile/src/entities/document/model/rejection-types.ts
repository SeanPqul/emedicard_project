import { Id } from '@backend/convex/_generated/dataModel';

/**
 * Document rejection history interface
 * Tracks all document rejections for audit trail
 */
export interface RejectionHistory {
  _id: Id<"documentRejectionHistory">;
  applicationId: Id<"applications">;
  documentTypeId: Id<"documentTypes">;
  documentUploadId: Id<"documentUploads">;
  
  // Preserved File Data
  rejectedFileId: Id<"_storage">; // Never delete this
  originalFileName: string;
  fileSize: number;
  fileType: string;
  
  // Rejection Information
  rejectionCategory: RejectionCategory;
  rejectionReason: string;
  specificIssues: string[];
  
  // Tracking
  rejectedBy: Id<"users">;
  rejectedAt: number;
  
  // Resubmission Tracking
  wasReplaced: boolean;
  replacementUploadId?: Id<"documentUploads">;
  replacedAt?: number;
  attemptNumber: number;
  
  // Audit Fields
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Rejection categories
 * Used to categorize document rejection reasons
 */
export enum RejectionCategory {
  QUALITY_ISSUE = "quality_issue",
  WRONG_DOCUMENT = "wrong_document",
  EXPIRED_DOCUMENT = "expired_document",
  INCOMPLETE_DOCUMENT = "incomplete_document",
  INVALID_DOCUMENT = "invalid_document",
  FORMAT_ISSUE = "format_issue",
  OTHER = "other"
}

/**
 * Document status enum
 * Tracks the current state of a document upload
 */
export enum DocumentStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  RESUBMITTED = "Resubmitted"
}

/**
 * Rejection category labels for UI display
 */
export const RejectionCategoryLabels: Record<RejectionCategory, string> = {
  [RejectionCategory.QUALITY_ISSUE]: "Quality Issue",
  [RejectionCategory.WRONG_DOCUMENT]: "Wrong Document",
  [RejectionCategory.EXPIRED_DOCUMENT]: "Expired Document",
  [RejectionCategory.INCOMPLETE_DOCUMENT]: "Incomplete Document",
  [RejectionCategory.INVALID_DOCUMENT]: "Invalid Document",
  [RejectionCategory.FORMAT_ISSUE]: "Format Issue",
  [RejectionCategory.OTHER]: "Other"
};

/**
 * Rejection category descriptions
 */
export const RejectionCategoryDescriptions: Record<RejectionCategory, string> = {
  [RejectionCategory.QUALITY_ISSUE]: "Blurry, dark, or unreadable document",
  [RejectionCategory.WRONG_DOCUMENT]: "Incorrect document type uploaded",
  [RejectionCategory.EXPIRED_DOCUMENT]: "Document is past its validity date",
  [RejectionCategory.INCOMPLETE_DOCUMENT]: "Missing pages or information",
  [RejectionCategory.INVALID_DOCUMENT]: "Fake or tampered document",
  [RejectionCategory.FORMAT_ISSUE]: "Wrong format or file size",
  [RejectionCategory.OTHER]: "Other rejection reason"
};

/**
 * Enriched rejection data with additional information
 * This is the rejection history with document and user details included
 */
export interface EnrichedRejection {
  _id: Id<"documentRejectionHistory">;
  documentTypeName: string;
  documentTypeIcon?: string;
  rejectionCategory: RejectionCategory;
  rejectionReason: string;
  specificIssues: string[];
  rejectedAt: number;
  rejectedByName: string;
  attemptNumber: number;
  wasReplaced: boolean;
  replacedAt?: number;
  replacementInfo: {
    uploadId: Id<"documentUploads">;
    fileName: string;
    uploadedAt: number;
    reviewStatus: string;
  } | null;
  documentTypeId: Id<"documentTypes">;
  applicationId: Id<"applications">;
}

/**
 * Rejection details with enriched data
 */
export interface EnrichedRejectionHistory extends RejectionHistory {
  documentTypeName: string;
  rejectedByName: string;
  rejectedByRole: string;
  rejectionCategoryLabel: string;
  formattedRejectedAt: string;
  formattedReplacedAt?: string;
}

/**
 * API response types for rejection queries
 */
export interface GetRejectionHistoryResponse {
  rejections: EnrichedRejectionHistory[];
  totalCount: number;
}

export interface GetRejectedDocumentsCountResponse {
  count: number;
  byCategory: Record<RejectionCategory, number>;
}

export interface GetDocumentRejectionDetailsResponse {
  rejection: EnrichedRejectionHistory;
  previousAttempts: RejectionHistory[];
  documentType: {
    name: string;
    description: string;
    required: boolean;
  };
}
