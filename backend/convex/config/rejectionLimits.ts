// convex/config/rejectionLimits.ts
/**
 * Configuration for rejection attempt limits
 * Controls how many times applicants can resubmit documents and payments
 */

export const REJECTION_LIMITS = {
  // Document Rejection Limits
  DOCUMENTS: {
    MAX_ATTEMPTS: 3, // Maximum number of attempts per document type
    WARNING_THRESHOLD: 2, // Show warning when reaching this attempt number
    FINAL_ATTEMPT_WARNING: 3, // This is the final attempt
  },
  
  // Payment Rejection Limits
  PAYMENTS: {
    MAX_ATTEMPTS: 3, // Maximum number of payment attempts
    WARNING_THRESHOLD: 2, // Show warning when reaching this attempt number
    FINAL_ATTEMPT_WARNING: 3, // This is the final attempt
  },
  
  // System Behavior
  BEHAVIOR: {
    AUTO_LOCK_APPLICATION: true, // Automatically lock application after max attempts
    ALLOW_ADMIN_OVERRIDE: true, // Allow admins to manually unlock
    NOTIFY_SUPPORT_TEAM: true, // Notify support when max attempts reached
    GRACE_PERIOD_HOURS: 48, // Hours before permanent rejection (for manual review)
  },
  
  // Notification Messages
  MESSAGES: {
    ATTEMPT_WARNING: (current: number, max: number) => 
      `⚠️ Warning: This is attempt ${current} of ${max}. Please review carefully before submitting.`,
    
    FINAL_ATTEMPT: (max: number) => 
      `🚨 FINAL ATTEMPT: You have reached ${max} of ${max} attempts. This is your last chance to submit correctly.`,
    
    MAX_REACHED: (type: 'document' | 'payment') => 
      `You have reached the maximum number of ${type} submission attempts. Please contact support for assistance.`,
    
    APPLICATION_LOCKED: 
      `Your application has been locked due to multiple failed submissions. Our support team will review your case and contact you within 48 hours.`,
  }
};

// Helper function to check if max attempts reached
export const hasReachedMaxAttempts = (
  attemptNumber: number,
  type: 'document' | 'payment'
): boolean => {
  const maxAttempts = type === 'document' 
    ? REJECTION_LIMITS.DOCUMENTS.MAX_ATTEMPTS 
    : REJECTION_LIMITS.PAYMENTS.MAX_ATTEMPTS;
  
  return attemptNumber >= maxAttempts;
};

// Helper function to get warning message
export const getAttemptWarningMessage = (
  attemptNumber: number,
  type: 'document' | 'payment'
): string | null => {
  const config = type === 'document' 
    ? REJECTION_LIMITS.DOCUMENTS 
    : REJECTION_LIMITS.PAYMENTS;
  
  if (attemptNumber === config.FINAL_ATTEMPT_WARNING) {
    return REJECTION_LIMITS.MESSAGES.FINAL_ATTEMPT(config.MAX_ATTEMPTS);
  }
  
  if (attemptNumber === config.WARNING_THRESHOLD) {
    return REJECTION_LIMITS.MESSAGES.ATTEMPT_WARNING(attemptNumber, config.MAX_ATTEMPTS);
  }
  
  return null;
};
