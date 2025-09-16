import { Application, ApplicationStatus, ApplicationType } from './model';

/**
 * Application Entity - Utility Library
 * Application-specific utility functions and business logic
 */

// ===== VALIDATION UTILITIES =====

/**
 * Validates application data before submission
 */
export const validateApplication = (application: Partial<Application>): string[] => {
  const errors: string[] = [];

  if (!application.applicationType) {
    errors.push('Application type is required');
  }

  if (!application.jobCategoryId) {
    errors.push('Job category is required');
  }

  if (!application.position || application.position.trim() === '') {
    errors.push('Position is required');
  }

  if (!application.organization || application.organization.trim() === '') {
    errors.push('Organization is required');
  }

  if (!application.civilStatus) {
    errors.push('Civil status is required');
  }

  // Validate position length
  if (application.position && application.position.length > 100) {
    errors.push('Position must be less than 100 characters');
  }

  // Validate organization length
  if (application.organization && application.organization.length > 100) {
    errors.push('Organization must be less than 100 characters');
  }

  return errors;
};

/**
 * Validates payment information
 */
export const validatePaymentInfo = (
  paymentMethod?: string,
  referenceNumber?: string
): string[] => {
  const errors: string[] = [];

  if (!paymentMethod) {
    errors.push('Payment method is required');
  }

  if (!referenceNumber || referenceNumber.trim() === '') {
    errors.push('Payment reference number is required');
  }

  // Validate reference number format based on payment method
  if (paymentMethod && referenceNumber) {
    switch (paymentMethod) {
      case 'Gcash':
        if (!/^\d{13}$/.test(referenceNumber)) {
          errors.push('GCash reference number should be 13 digits');
        }
        break;
      case 'Maya':
        if (!/^\d{12,15}$/.test(referenceNumber)) {
          errors.push('Maya reference number should be 12-15 digits');
        }
        break;
      case 'BaranggayHall':
      case 'CityHall':
        if (referenceNumber.length < 5) {
          errors.push('Reference number should be at least 5 characters');
        }
        break;
    }
  }

  return errors;
};

// ===== FORMATTING UTILITIES =====

/**
 * Formats application type for display
 */
export const formatApplicationType = (type: ApplicationType): string => {
  const typeMap: Record<ApplicationType, string> = {
    'New': 'New Application',
    'Renew': 'Renewal Application',
  };

  return typeMap[type] || type;
};

/**
 * Formats application creation date
 */
export const formatApplicationDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats application duration (time since creation)
 */
export const getApplicationAge = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return '1 day ago';
  } else if (days < 30) {
    return `${days} days ago`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(days / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
};

// ===== FILTERING UTILITIES =====

/**
 * Filters applications by status
 */
export const filterApplicationsByStatus = (
  applications: Application[],
  status: ApplicationStatus
): Application[] => {
  return applications.filter(app => app.status === status);
};

/**
 * Filters applications by type
 */
export const filterApplicationsByType = (
  applications: Application[],
  type: ApplicationType
): Application[] => {
  return applications.filter(app => app.applicationType === type);
};

/**
 * Searches applications by position or organization
 */
export const searchApplications = (
  applications: Application[],
  query: string
): Application[] => {
  if (!query.trim()) {
    return applications;
  }

  const lowercaseQuery = query.toLowerCase();
  
  return applications.filter(app => 
    app.position.toLowerCase().includes(lowercaseQuery) ||
    app.organization.toLowerCase().includes(lowercaseQuery)
  );
};

// ===== SORTING UTILITIES =====

/**
 * Sorts applications by creation date (newest first)
 */
export const sortApplicationsByDate = (applications: Application[]): Application[] => {
  return [...applications].sort((a, b) => b._creationTime - a._creationTime);
};

/**
 * Sorts applications by status priority
 */
export const sortApplicationsByStatus = (applications: Application[]): Application[] => {
  const statusPriority: Record<ApplicationStatus, number> = {
    'Draft': 1,
    'Rejected': 2,
    'Submitted': 3,
    'Under Review': 4,
    'Approved': 5,
    'Completed': 6,
  };

  return [...applications].sort((a, b) => {
    const aPriority = statusPriority[a.status] || 0;
    const bPriority = statusPriority[b.status] || 0;
    return aPriority - bPriority;
  });
};

// ===== ANALYTICS UTILITIES =====

/**
 * Gets application statistics
 */
export const getApplicationStats = (applications: Application[]) => {
  const stats = {
    total: applications.length,
    draft: 0,
    submitted: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    newApplications: 0,
    renewals: 0,
  };

  applications.forEach(app => {
    // Count by status
    switch (app.status) {
      case 'Draft':
        stats.draft++;
        break;
      case 'Submitted':
        stats.submitted++;
        break;
      case 'Under Review':
        stats.underReview++;
        break;
      case 'Approved':
        stats.approved++;
        break;
      case 'Rejected':
        stats.rejected++;
        break;
      case 'Completed':
        stats.completed++;
        break;
    }

    // Count by type
    if (app.applicationType === 'New') {
      stats.newApplications++;
    } else {
      stats.renewals++;
    }
  });

  return stats;
};