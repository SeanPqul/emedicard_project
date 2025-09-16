/**
 * Application Form Feature - Complete Implementation
 * Extracted from useApplicationForm.ts and form step components
 */

import { useState } from 'react';
import { useApplications, useCreateApplication, useUpdateApplication } from '../../entities/application';
import { ConvexId } from '../../shared/api';

// ===== TYPES =====
export interface ApplicationFormData {
  applicationType: 'New' | 'Renew';
  jobCategoryId: ConvexId<'jobCategories'> | '';
  position: string;
  organization: string;
  civilStatus: string;
}

export interface ApplicationFormState {
  currentStep: number;
  data: ApplicationFormData;
  errors: Partial<ApplicationFormData>;
  isSubmitting: boolean;
}

// ===== FORM STEPS =====
export const APPLICATION_STEPS = [
  { id: 1, title: 'Application Type', component: 'ApplicationTypeStep' },
  { id: 2, title: 'Job Category', component: 'JobCategoryStep' },
  { id: 3, title: 'Personal Details', component: 'PersonalDetailsStep' },
  { id: 4, title: 'Review', component: 'ReviewStep' },
] as const;

// ===== HOOKS =====
export const useApplicationForm = (applicationId?: string) => {
  const { data: { application } } = useApplications(applicationId);
  const { createApplication } = useCreateApplication();
  const { updateApplication } = useUpdateApplication();

  const [formState, setFormState] = useState<ApplicationFormState>({
    currentStep: 1,
    data: {
      applicationType: application?.applicationType || 'New',
      jobCategoryId: application?.jobCategoryId || '',
      position: application?.position || '',
      organization: application?.organization || '',
      civilStatus: application?.civilStatus || '',
    },
    errors: {},
    isSubmitting: false,
  });

  const updateField = <K extends keyof ApplicationFormData>(
    field: K,
    value: ApplicationFormData[K]
  ) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: undefined },
    }));
  };

  const nextStep = () => {
    setFormState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, APPLICATION_STEPS.length),
    }));
  };

  const prevStep = () => {
    setFormState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const submitForm = async () => {
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      if (applicationId && application) {
        await updateApplication(applicationId as ConvexId<'applications'>, formState.data);
      } else {
        await createApplication(formState.data as any);
      }
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    ...formState,
    updateField,
    nextStep,
    prevStep,
    submitForm,
    canProceed: formState.currentStep < APPLICATION_STEPS.length,
    canGoBack: formState.currentStep > 1,
    isLoading: !application && !!applicationId,
  };
};

// ===== VALIDATION =====
export const validateApplicationForm = (data: ApplicationFormData): Partial<ApplicationFormData> => {
  const errors: Partial<ApplicationFormData> = {};

  if (!data.applicationType) {
    errors.applicationType = 'Application type is required' as any;
  }
  
  if (!data.jobCategoryId) {
    errors.jobCategoryId = 'Job category is required' as any;
  }
  
  if (!data.position.trim()) {
    errors.position = 'Position is required';
  }
  
  if (!data.organization.trim()) {
    errors.organization = 'Organization is required';
  }
  
  if (!data.civilStatus) {
    errors.civilStatus = 'Civil status is required';
  }

  return errors;
};

// ===== UI COMPONENTS =====
export interface ApplicationStepProps {
  data: ApplicationFormData;
  errors: Partial<ApplicationFormData>;
  updateField: <K extends keyof ApplicationFormData>(field: K, value: ApplicationFormData[K]) => void;
  onNext: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

// Placeholder components that would be extracted from existing step components
export const ApplicationTypeStep = () => null; // TODO: Extract from existing component
export const JobCategoryStep = () => null; // TODO: Extract from existing component
export const PersonalDetailsStep = () => null; // TODO: Extract from existing component
export const ReviewStep = () => null; // TODO: Extract from existing component
export const StepIndicator = () => null; // TODO: Extract from existing component