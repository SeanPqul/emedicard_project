export type ApplicationType = 'New' | 'Renew';

export interface ApplicationFormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';
}

export interface ApplicationTypeStepProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  errors: Record<string, string>;
}
