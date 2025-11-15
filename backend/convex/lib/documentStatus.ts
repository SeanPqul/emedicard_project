/**
 * Document Status Utilities
 * 
 * Helper functions to handle document review status consistently across the system.
 * "Verified" and "Approved" are treated as equivalent for backward compatibility.
 */

/**
 * Check if a document is verified/approved
 * Treats "Verified" and "Approved" as equivalent
 */
export const isDocumentVerified = (reviewStatus: string | undefined): boolean => {
  if (!reviewStatus) return false;
  return reviewStatus === "Verified" || reviewStatus === "Approved";
};

/**
 * Check if all documents in an array are verified/approved
 */
export const areAllDocumentsVerified = (documents: Array<{ reviewStatus?: string }>): boolean => {
  if (documents.length === 0) return false;
  return documents.every(doc => isDocumentVerified(doc.reviewStatus));
};

/**
 * The preferred status to write for new document approvals
 * Can be changed to "Verified" in the future without breaking existing code
 */
export const DOCUMENT_VERIFIED_STATUS = "Approved" as const;

/**
 * All possible document review statuses
 */
export const DOCUMENT_STATUS = {
  PENDING: "Pending",
  VERIFIED: "Verified", // Industry standard (medical)
  APPROVED: "Approved", // Legacy/alternate term (same meaning)
  REJECTED: "Rejected", // Deprecated - use Referred or NeedsRevision instead
  REFERRED: "Referred", // Medical referral needed
  NEEDS_REVISION: "NeedsRevision", // Document quality issue
} as const;
