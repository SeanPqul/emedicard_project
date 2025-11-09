/**
 * Notification Type Mapping
 * Maps backend notification types to user-friendly frontend labels
 */

export type NotificationType =
  | "DocumentResubmission"
  | "PaymentResubmission"
  | "ApplicationStatusChange"
  | "ApplicationApproved"
  | "ApplicationRejected"
  | "application_permanently_rejected"
  | "DocumentIssue"
  | "document_issue_flagged"
  | "document_referral_medical"
  | "document_rejection"
  | "DocumentApproved"
  | "PaymentReceived"
  | "OrientationScheduled"
  | "CardIssue"
  | "MissingDoc"
  | "MedicalReferralResubmission"
  | "status_update"
  | string;

/**
 * Get user-friendly label for notification type
 */
export function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    // Document related
    "DocumentResubmission": "Document Resubmitted",
    "document_issue_flagged": "Document Issue Flagged",
    "document_referral_medical": "Medical Referral",
    "document_rejection": "Document Rejected",
    "DocumentApproved": "Document Approved",
    "DocumentIssue": "Document Issue",
    "MissingDoc": "Missing Document",
    
    // Medical Referral
    "MedicalReferralResubmission": "Medical Referral Resubmitted",
    
    // Payment related
    "PaymentResubmission": "Payment Resubmitted",
    "PaymentReceived": "Payment Received",
    
    // Application related
    "ApplicationStatusChange": "Application Status Update",
    "ApplicationApproved": "Application Approved",
    "ApplicationRejected": "Application Rejected",
    "application_permanently_rejected": "Application Permanently Rejected",
    "status_update": "Status Update",
    
    // Orientation
    "OrientationScheduled": "Orientation Scheduled",
    
    // Card
    "CardIssue": "Card Issue",
  };

  return labels[type] || type.replace(/([A-Z_])/g, " $1").trim();
}

/**
 * Get category for notification type (for grouping/filtering)
 */
export function getNotificationCategory(type: string): "document" | "payment" | "application" | "orientation" | "card" | "other" {
  if (
    type.includes("Document") ||
    type.includes("document") ||
    type.includes("MissingDoc") ||
    type.includes("Medical") ||
    type.includes("medical")
  ) {
    return "document";
  }
  
  if (type.includes("Payment") || type.includes("payment")) {
    return "payment";
  }
  
  if (
    type.includes("Application") ||
    type.includes("application") ||
    type.includes("status")
  ) {
    return "application";
  }
  
  if (type.includes("Orientation") || type.includes("orientation")) {
    return "orientation";
  }
  
  if (type.includes("Card") || type.includes("card")) {
    return "card";
  }
  
  return "other";
}

/**
 * Check if notification type is a medical referral
 */
export function isMedicalReferral(type: string): boolean {
  return (
    type === "document_referral_medical" ||
    type === "MedicalReferralResubmission" ||
    type.toLowerCase().includes("medical")
  );
}

/**
 * Check if notification type is a document issue (non-medical)
 */
export function isDocumentIssue(type: string): boolean {
  return (
    type === "document_issue_flagged" ||
    type === "DocumentIssue" ||
    (type.includes("document") && !isMedicalReferral(type))
  );
}

/**
 * Check if notification type is an application rejection
 */
export function isApplicationRejection(type: string): boolean {
  return (
    type === "application_permanently_rejected" ||
    type === "ApplicationRejected"
  );
}

/**
 * Get grouped notification types for dropdown
 */
export interface NotificationTypeGroup {
  label: string;
  types: { value: string; label: string }[];
}

export function getGroupedNotificationTypes(availableTypes: string[]): NotificationTypeGroup[] {
  const documentTypes = availableTypes.filter(
    (t) => getNotificationCategory(t) === "document"
  );
  const paymentTypes = availableTypes.filter(
    (t) => getNotificationCategory(t) === "payment"
  );
  const applicationTypes = availableTypes.filter(
    (t) => getNotificationCategory(t) === "application"
  );
  const otherTypes = availableTypes.filter(
    (t) => 
      !documentTypes.includes(t) &&
      !paymentTypes.includes(t) &&
      !applicationTypes.includes(t)
  );

  const groups: NotificationTypeGroup[] = [];

  if (documentTypes.length > 0) {
    groups.push({
      label: "Document & Medical",
      types: documentTypes.map((t) => ({
        value: t,
        label: getNotificationTypeLabel(t),
      })),
    });
  }

  if (paymentTypes.length > 0) {
    groups.push({
      label: "Payment",
      types: paymentTypes.map((t) => ({
        value: t,
        label: getNotificationTypeLabel(t),
      })),
    });
  }

  if (applicationTypes.length > 0) {
    groups.push({
      label: "Application",
      types: applicationTypes.map((t) => ({
        value: t,
        label: getNotificationTypeLabel(t),
      })),
    });
  }

  if (otherTypes.length > 0) {
    groups.push({
      label: "Other",
      types: otherTypes.map((t) => ({
        value: t,
        label: getNotificationTypeLabel(t),
      })),
    });
  }

  return groups;
}
