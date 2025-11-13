// Use canonical ApplicationFormData type re-exported from the application feature
import type { ApplicationFormData } from '../../../types';
import { JobCategory } from '@/src/entities/application';

export interface PersonalDetailsStepProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  errors: Record<string, string>;
  jobCategoriesData?: JobCategory[];
}
