import { ConvexId } from '../../shared/api';

/**
 * Application Entity - Domain Model
 * Contains all application-related types, interfaces, and business logic
 */

// ===== CORE APPLICATION TYPES =====

export type ApplicationStatus = "Draft" | "Submitted" | "Under Review" | "Approved" | "Rejected" | "Completed";
export type ApplicationType = "New" | "Renew";
export type PaymentMethod = "Gcash" | "Maya" | "BaranggayHall" | "CityHall";

export interface Application {
  _id: ConvexId<"applications">;
  userId: ConvexId<"users">;
  applicationType: ApplicationType;
  jobCategoryId: ConvexId<"jobCategories">;
  position: string;
  organization: string;
  civilStatus: string;
  status: ApplicationStatus;
  paymentMethod?: PaymentMethod;
  paymentReferenceNumber?: string;
  paymentReceiptId?: ConvexId<"_storage">;
  submittedAt?: number;
  approvedAt?: number;
  _creationTime: number;
}

// ===== INPUT TYPES =====

export interface CreateApplicationInput {
  applicationType: ApplicationType;
  jobCategoryId: ConvexId<"jobCategories">;
  position: string;
  organization: string;
  civilStatus: string;
}

export interface UpdateApplicationInput {
  applicationType?: ApplicationType;
  jobCategoryId?: ConvexId<"jobCategories">;
  position?: string;
  organization?: string;
  civilStatus?: string;
  status?: ApplicationStatus;
}

export interface SubmitApplicationInput {
  applicationId: ConvexId<"applications">;
  paymentMethod: PaymentMethod;
  paymentReferenceNumber: string;
  paymentReceiptId?: ConvexId<"_storage">;
}

// ===== DOMAIN LOGIC =====

/**
 * Checks if an application can be edited
 */
export const canEditApplication = (application: Application): boolean => {
  return application.status === "Draft" || application.status === "Rejected";
};

/**
 * Checks if an application can be submitted
 */
export const canSubmitApplication = (application: Application): boolean => {
  return application.status === "Draft" && 
         isApplicationComplete(application);
};

/**
 * Checks if an application is complete and ready for submission
 */
export const isApplicationComplete = (application: Application): boolean => {
  const requiredFields: (keyof Application)[] = [
    'applicationType',
    'jobCategoryId',
    'position',
    'organization',
    'civilStatus'
  ];

  return requiredFields.every(field => {
    const value = application[field];
    return value !== undefined && value !== null && value !== '';
  });
};

/**
 * Checks if an application requires payment
 */
export const requiresPayment = (application: Application): boolean => {
  return application.status === "Submitted" || 
         application.status === "Under Review" ||
         application.status === "Approved";
};

/**
 * Gets the next possible statuses for an application
 */
export const getNextPossibleStatuses = (
  currentStatus: ApplicationStatus,
  userRole: 'applicant' | 'inspector' | 'admin'
): ApplicationStatus[] => {
  if (userRole === 'applicant') {
    switch (currentStatus) {
      case "Draft":
        return ["Submitted"];
      case "Rejected":
        return ["Submitted"];
      default:
        return [];
    }
  }

  if (userRole === 'inspector' || userRole === 'admin') {
    switch (currentStatus) {
      case "Submitted":
        return ["Under Review", "Rejected"];
      case "Under Review":
        return ["Approved", "Rejected"];
      case "Approved":
        return ["Completed"];
      default:
        return [];
    }
  }

  return [];
};

/**
 * Calculates application completion percentage
 */
export const getApplicationProgress = (application: Application): number => {
  const steps = [
    { key: 'applicationType', weight: 15 },
    { key: 'jobCategoryId', weight: 15 },
    { key: 'position', weight: 20 },
    { key: 'organization', weight: 20 },
    { key: 'civilStatus', weight: 10 },
    { key: 'paymentMethod', weight: 10 },
    { key: 'paymentReferenceNumber', weight: 10 },
  ] as const;

  let completedWeight = 0;

  steps.forEach(({ key, weight }) => {
    const value = application[key];
    const isComplete = value !== undefined && value !== null && value !== '';
    
    if (isComplete) {
      completedWeight += weight;
    }
  });

  return Math.min(completedWeight, 100);
};

/**
 * Gets missing required fields for application
 */
export const getMissingApplicationFields = (application: Application): string[] => {
  const requiredFields = [
    { key: 'applicationType', label: 'Application Type' },
    { key: 'jobCategoryId', label: 'Job Category' },
    { key: 'position', label: 'Position' },
    { key: 'organization', label: 'Organization' },
    { key: 'civilStatus', label: 'Civil Status' },
  ] as const;

  return requiredFields
    .filter(({ key }) => {
      const value = application[key];
      return value === undefined || value === null || value === '';
    })
    .map(({ label }) => label);
};

/**
 * Formats application status for display
 */
export const formatApplicationStatus = (status: ApplicationStatus): string => {
  const statusMap: Record<ApplicationStatus, string> = {
    "Draft": "Draft",
    "Submitted": "Submitted",
    "Under Review": "Under Review",
    "Approved": "Approved",
    "Rejected": "Rejected",
    "Completed": "Completed",
  };

  return statusMap[status] || status;
};

/**
 * Gets status color for UI display
 */
export const getStatusColor = (status: ApplicationStatus): string => {
  const colorMap: Record<ApplicationStatus, string> = {
    "Draft": "#6B7280", // Gray
    "Submitted": "#3B82F6", // Blue
    "Under Review": "#F59E0B", // Yellow
    "Approved": "#10B981", // Green
    "Rejected": "#EF4444", // Red
    "Completed": "#8B5CF6", // Purple
  };

  return colorMap[status] || "#6B7280";
};

/**
 * Checks if an application is in a final state
 */
export const isFinalStatus = (status: ApplicationStatus): boolean => {
  return status === "Completed" || status === "Rejected";
};