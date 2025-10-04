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

// ApplicationFormData is now defined and exported from ./services/applicationService
// Re-export it here for backward compatibility
export type { ApplicationFormData } from './services/applicationService';

// Import for local use
import type { ApplicationFormData } from './services/applicationService';

// Form-specific types are now defined in entities/application/model/types.ts
