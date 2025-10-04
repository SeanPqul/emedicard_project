import { ApplicationFormData } from '../ApplicationTypeStep';
import { JobCategory } from '@/src/entities/application';

export interface PersonalDetailsStepProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  errors: Record<string, string>;
  jobCategoriesData?: JobCategory[];
}
