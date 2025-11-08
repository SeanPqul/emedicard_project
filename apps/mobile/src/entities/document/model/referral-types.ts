import { Id } from '@backend/convex/_generated/dataModel';

/**
 * Document Referral/Issue History Interface
 * Tracks medical referrals and document issues for audit trail
 * Uses proper medical terminology: "referral" not "rejection"
 */
export interface ReferralHistory {
  _id: Id<"documentReferralHistory">;
  applicationId: Id<"applications">;
  documentTypeId: Id<"documentTypes">;
  documentUploadId: Id<"documentUploads">;

  // Preserved File Data
  referredFileId: Id<"_storage">; // Never delete this
  originalFileName: string;
  fileSize: number;
  fileType: string;

  // Issue Type (Medical vs Non-Medical)
  issueType: IssueType;

  // Medical Referral Category (for medical documents)
  medicalReferralCategory?: MedicalReferralCategory;

  // Document Issue Category (for non-medical documents)
  documentIssueCategory?: DocumentIssueCategory;

  // Referral/Issue Information
  referralReason: string; // User-friendly explanation
  specificIssues: string[]; // Bullet points
  doctorName?: string; // Required for medical referrals
  clinicAddress?: string; // Venue for medical consultation

  // Tracking
  referredBy: Id<"users">; // Admin who created this
  referredAt: number;

  // Resubmission/Return Tracking
  wasReplaced: boolean;
  replacementUploadId?: Id<"documentUploads">;
  replacedAt?: number;
  attemptNumber: number;

  // Status Flow
  status?: ReferralStatus;

  // Notification Tracking
  notificationSent?: boolean;
  notificationSentAt?: number;

  // Audit Fields
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Issue Type: Medical Referral vs Document Issue
 */
export enum IssueType {
  MEDICAL_REFERRAL = "medical_referral",    // Medical finding - needs doctor consultation
  DOCUMENT_ISSUE = "document_issue"         // Non-medical - needs document resubmission
}

/**
 * Medical Referral Categories
 * Used when medical documents show findings requiring doctor consultation
 */
export enum MedicalReferralCategory {
  ABNORMAL_XRAY = "abnormal_xray",                  // Abnormal chest X-ray result
  ELEVATED_URINALYSIS = "elevated_urinalysis",      // Elevated urinalysis values
  POSITIVE_STOOL = "positive_stool",                // Positive stool examination
  POSITIVE_DRUG_TEST = "positive_drug_test",        // Positive drug test result
  NEURO_EXAM_FAILED = "neuro_exam_failed",          // Failed neuropsychiatric evaluation
  HEPATITIS_CONSULTATION = "hepatitis_consultation", // Hepatitis B - requires consultation
  OTHER_MEDICAL = "other_medical_concern"           // Other medical concern
}

/**
 * Document Issue Categories
 * Used when non-medical documents have quality/compliance issues
 */
export enum DocumentIssueCategory {
  INVALID_ID = "invalid_id",              // Invalid Government-issued ID
  EXPIRED_ID = "expired_id",              // Expired ID
  BLURRY_PHOTO = "blurry_photo",          // Blurry or unclear photo
  WRONG_FORMAT = "wrong_format",          // Wrong ID picture format/size
  MISSING_INFO = "missing_info",          // Missing required information
  QUALITY_ISSUE = "quality_issue",        // Blurry, dark, unreadable
  WRONG_DOCUMENT = "wrong_document",      // Incorrect document type
  EXPIRED_DOCUMENT = "expired_document",  // Document past validity
  INCOMPLETE_DOCUMENT = "incomplete_document", // Missing pages/information
  INVALID_DOCUMENT = "invalid_document",  // Fake or tampered
  FORMAT_ISSUE = "format_issue",          // Wrong format/size
  OTHER = "other"                         // Other reasons
}

/**
 * Referral Status Flow
 */
export enum ReferralStatus {
  PENDING = "pending",           // Waiting for user action (treatment or resubmission)
  IN_PROGRESS = "in_progress",   // User is addressing the issue
  RESUBMITTED = "resubmitted",   // User has resubmitted/returned
  CLEARED = "cleared",           // Issue resolved, user can proceed
  FLAGGED_AGAIN = "flagged_again" // Issue persists
}

/**
 * Document Status Enum (Updated)
 */
export enum DocumentStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",              // DEPRECATED - use Referred or NeedsRevision
  REFERRED = "Referred",              // NEW - Medical finding, needs consultation
  NEEDS_REVISION = "NeedsRevision"    // NEW - Document issue, needs resubmission
}

/**
 * Medical Referral Category Labels for UI
 */
export const MedicalReferralCategoryLabels: Record<MedicalReferralCategory, string> = {
  [MedicalReferralCategory.ABNORMAL_XRAY]: "Abnormal Chest X-ray",
  [MedicalReferralCategory.ELEVATED_URINALYSIS]: "Elevated Urinalysis",
  [MedicalReferralCategory.POSITIVE_STOOL]: "Positive Stool Exam",
  [MedicalReferralCategory.POSITIVE_DRUG_TEST]: "Positive Drug Test",
  [MedicalReferralCategory.NEURO_EXAM_FAILED]: "Neuro Exam - Requires Consultation",
  [MedicalReferralCategory.HEPATITIS_CONSULTATION]: "Hepatitis B - Consultation Needed",
  [MedicalReferralCategory.OTHER_MEDICAL]: "Other Medical Concern"
};

/**
 * Medical Referral Category Descriptions (Patient-Friendly)
 */
export const MedicalReferralCategoryDescriptions: Record<MedicalReferralCategory, string> = {
  [MedicalReferralCategory.ABNORMAL_XRAY]: "Your chest X-ray shows findings that require medical attention",
  [MedicalReferralCategory.ELEVATED_URINALYSIS]: "Your urinalysis results show elevated values requiring consultation",
  [MedicalReferralCategory.POSITIVE_STOOL]: "Your stool examination requires medical follow-up",
  [MedicalReferralCategory.POSITIVE_DRUG_TEST]: "Your drug test requires medical consultation",
  [MedicalReferralCategory.NEURO_EXAM_FAILED]: "Your neuropsychiatric evaluation requires further consultation",
  [MedicalReferralCategory.HEPATITIS_CONSULTATION]: "Your Hepatitis B test requires medical consultation",
  [MedicalReferralCategory.OTHER_MEDICAL]: "Medical consultation required"
};

/**
 * Document Issue Category Labels for UI
 */
export const DocumentIssueCategoryLabels: Record<DocumentIssueCategory, string> = {
  [DocumentIssueCategory.INVALID_ID]: "Invalid ID",
  [DocumentIssueCategory.EXPIRED_ID]: "Expired ID",
  [DocumentIssueCategory.BLURRY_PHOTO]: "Blurry Photo",
  [DocumentIssueCategory.WRONG_FORMAT]: "Wrong Format",
  [DocumentIssueCategory.MISSING_INFO]: "Missing Information",
  [DocumentIssueCategory.QUALITY_ISSUE]: "Quality Issue",
  [DocumentIssueCategory.WRONG_DOCUMENT]: "Wrong Document",
  [DocumentIssueCategory.EXPIRED_DOCUMENT]: "Expired Document",
  [DocumentIssueCategory.INCOMPLETE_DOCUMENT]: "Incomplete Document",
  [DocumentIssueCategory.INVALID_DOCUMENT]: "Invalid Document",
  [DocumentIssueCategory.FORMAT_ISSUE]: "Format Issue",
  [DocumentIssueCategory.OTHER]: "Other Issue"
};

/**
 * Document Issue Category Descriptions
 */
export const DocumentIssueCategoryDescriptions: Record<DocumentIssueCategory, string> = {
  [DocumentIssueCategory.INVALID_ID]: "The ID provided is not valid",
  [DocumentIssueCategory.EXPIRED_ID]: "The ID has expired",
  [DocumentIssueCategory.BLURRY_PHOTO]: "The photo is unclear or blurry",
  [DocumentIssueCategory.WRONG_FORMAT]: "The format or size is incorrect",
  [DocumentIssueCategory.MISSING_INFO]: "Required information is missing",
  [DocumentIssueCategory.QUALITY_ISSUE]: "Image quality is poor or unreadable",
  [DocumentIssueCategory.WRONG_DOCUMENT]: "Wrong type of document uploaded",
  [DocumentIssueCategory.EXPIRED_DOCUMENT]: "Document is past validity date",
  [DocumentIssueCategory.INCOMPLETE_DOCUMENT]: "Missing pages or information",
  [DocumentIssueCategory.INVALID_DOCUMENT]: "Document appears fake or tampered",
  [DocumentIssueCategory.FORMAT_ISSUE]: "Wrong file format or size",
  [DocumentIssueCategory.OTHER]: "Other document issue"
};

/**
 * Enriched referral data with additional information
 */
export interface EnrichedReferral {
  _id: Id<"documentReferralHistory">;
  documentTypeName: string;
  documentTypeIcon?: string;
  issueType: IssueType;
  category: MedicalReferralCategory | DocumentIssueCategory;
  reason: string;
  specificIssues: string[];
  doctorName?: string;
  clinicAddress?: string;
  referredAt: number;
  referredByName: string;
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
  source?: 'new' | 'old'; // For debugging during migration
}

/**
 * Referral details with enriched data
 */
export interface EnrichedReferralHistory extends ReferralHistory {
  documentTypeName: string;
  referredByName: string;
  referredByRole: string;
  categoryLabel: string;
  formattedReferredAt: string;
  formattedReplacedAt?: string;
}

/**
 * API response types for referral queries
 */
export interface GetReferralHistoryResponse {
  referrals: EnrichedReferralHistory[];
  totalCount: number;
  medicalCount: number;
  documentIssueCount: number;
}

export interface GetReferredDocumentsCountResponse {
  totalIssues: number;
  pendingResubmission: number;
  medicalReferrals: number;
  documentIssues: number;
  applications: number;
}

export interface GetDocumentReferralDetailsResponse {
  referral: EnrichedReferralHistory;
  previousAttempts: ReferralHistory[];
  documentType: {
    name: string;
    description: string;
    required: boolean;
  };
}

/**
 * Helper function to get category label
 */
export function getCategoryLabel(
  issueType: IssueType,
  category: MedicalReferralCategory | DocumentIssueCategory
): string {
  if (issueType === IssueType.MEDICAL_REFERRAL) {
    return MedicalReferralCategoryLabels[category as MedicalReferralCategory] || 'Unknown';
  } else {
    return DocumentIssueCategoryLabels[category as DocumentIssueCategory] || 'Unknown';
  }
}

/**
 * Helper function to get category description
 */
export function getCategoryDescription(
  issueType: IssueType,
  category: MedicalReferralCategory | DocumentIssueCategory
): string {
  if (issueType === IssueType.MEDICAL_REFERRAL) {
    return MedicalReferralCategoryDescriptions[category as MedicalReferralCategory] || 'Medical consultation required';
  } else {
    return DocumentIssueCategoryDescriptions[category as DocumentIssueCategory] || 'Document needs correction';
  }
}

/**
 * Helper function to determine if a status indicates medical referral
 */
export function isMedicalReferral(status: string): boolean {
  return status === DocumentStatus.REFERRED;
}

/**
 * Helper function to determine if a status indicates document issue
 */
export function isDocumentIssue(status: string): boolean {
  return status === DocumentStatus.NEEDS_REVISION;
}

/**
 * Helper function to get user-friendly status text
 */
export function getStatusText(issueType: IssueType, status?: ReferralStatus): string {
  if (!status) return 'Pending Action';

  const statusMap: Record<ReferralStatus, Record<IssueType, string>> = {
    [ReferralStatus.PENDING]: {
      [IssueType.MEDICAL_REFERRAL]: 'Awaiting Medical Consultation',
      [IssueType.DOCUMENT_ISSUE]: 'Awaiting Document Resubmission'
    },
    [ReferralStatus.IN_PROGRESS]: {
      [IssueType.MEDICAL_REFERRAL]: 'Undergoing Treatment',
      [IssueType.DOCUMENT_ISSUE]: 'Preparing Corrected Document'
    },
    [ReferralStatus.RESUBMITTED]: {
      [IssueType.MEDICAL_REFERRAL]: 'Returned for Re-check',
      [IssueType.DOCUMENT_ISSUE]: 'Document Resubmitted'
    },
    [ReferralStatus.CLEARED]: {
      [IssueType.MEDICAL_REFERRAL]: 'Medically Cleared',
      [IssueType.DOCUMENT_ISSUE]: 'Document Approved'
    },
    [ReferralStatus.FLAGGED_AGAIN]: {
      [IssueType.MEDICAL_REFERRAL]: 'Additional Treatment Needed',
      [IssueType.DOCUMENT_ISSUE]: 'Document Still Has Issues'
    }
  };

  return statusMap[status]?.[issueType] || 'Unknown Status';
}
