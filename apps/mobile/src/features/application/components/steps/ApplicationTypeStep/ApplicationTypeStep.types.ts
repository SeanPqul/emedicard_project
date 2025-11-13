// Consolidated types: import the canonical types from the application feature
import type { ApplicationFormData, ApplicationType } from '../../../types';

export interface ApplicationTypeStepProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  errors: Record<string, string>;
}

