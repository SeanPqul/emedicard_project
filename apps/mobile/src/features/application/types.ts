// Application feature types - Uses entities from entities layer (FSD pattern)
import type { 
  Application,
  ApplicationType,
  ApplicationStatus,
  JobCategory,
  DocumentRequirement
} from '@entities/application';

// Re-export entity types for backward compatibility  
export type { 
  Application,
  ApplicationType,
  ApplicationStatus,
  JobCategory,
  DocumentRequirement
};

// Application-specific feature types
export interface ApplicationFeatureState {
  // Application list state
  applications: Application[];
  isLoadingApplications: boolean;
  applicationsError: string | null;
  
  // Current application state
  currentApplication: Application | null;
  isLoadingCurrent: boolean;
  currentError: string | null;
  
  // Form state
  formData: ApplicationFormData | null;
  isSubmitting: boolean;
  submitError: string | null;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
  requirementId: string;
}

export interface ApplicationPayment {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  method?: string;
  paidAt?: Date;
}

export interface ApplicationFormData {
  applicationType: 'New' | 'Renew' | '';
  jobCategory: string;
  // Personal details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  organization: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  dateOfBirth: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  // Job details
  jobSalary?: string;
  employmentStatus?: string;
  workLocation?: string;
  startDate?: string;
}

// Form-specific types are now defined in entities/(screens)/(shared)/(screens)/(shared)/application/model/types.ts