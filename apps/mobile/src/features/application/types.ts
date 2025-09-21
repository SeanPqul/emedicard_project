// Application feature types
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

export interface Application {
  id: string;
  applicationType: 'New' | 'Renew';
  status: string;
  jobCategory: {
    id: string;
    name: string;
    colorCode: string;
    requireOrientation?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  position: string;
  organization: string;
  documents: ApplicationDocument[];
  payment?: ApplicationPayment;
  orientationCompleted?: boolean;
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

// Re-export types used in screens
export type { FormData, SelectedDocument, UploadState, FormErrors } from './screens/ApplyScreen';
