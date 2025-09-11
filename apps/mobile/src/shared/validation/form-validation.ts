/**
 * Simple Form Validation Utilities
 */

import { Alert } from 'react-native';
import type { DocumentRequirement, SelectedDocuments } from '../../types';

// ===== BASIC VALIDATION RESULT =====

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ===== SIMPLE VALIDATORS =====

export const validators = {
  required: (value: any): ValidationResult => {
    const isValid = value !== null && value !== undefined && String(value).trim() !== '';
    return isValid ? { valid: true } : { valid: false, error: 'This field is required' };
  },

  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    return isValid ? { valid: true } : { valid: false, error: 'Please enter a valid email address' };
  },

  phone: (value: string): ValidationResult => {
    const phoneRegex = /^(\+63|0)9\d{9}$/;
    const isValid = phoneRegex.test(value.replace(/\s/g, ''));
    return isValid ? { valid: true } : { valid: false, error: 'Please enter a valid Philippine phone number' };
  },

  minLength: (min: number) => (value: string): ValidationResult => {
    const isValid = value && value.length >= min;
    return isValid ? { valid: true } : { valid: false, error: `Must be at least ${min} characters long` };
  },

  password: (value: string): ValidationResult => {
    const isValid = value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
    return isValid ? { valid: true } : { valid: false, error: 'Password must be at least 8 characters with uppercase, lowercase, and number' };
  },
};

// ===== SIMPLE FIELD VALIDATION =====

export const validateField = (value: any, rules: { required?: boolean; minLength?: number; type?: 'email' | 'phone' | 'password' }): ValidationResult => {
  if (rules.required) {
    const result = validators.required(value);
    if (!result.valid) return result;
  }

  if (!value || String(value).trim() === '') {
    return { valid: true };
  }

  if (rules.minLength) {
    const result = validators.minLength(rules.minLength)(value);
    if (!result.valid) return result;
  }

  if (rules.type === 'email') {
    return validators.email(value);
  }

  if (rules.type === 'phone') {
    return validators.phone(value);
  }

  if (rules.type === 'password') {
    return validators.password(value);
  }

  return { valid: true };
};

// ===== FORM VALIDATION =====

export const validateForm = (formData: Record<string, any>, rules: Record<string, any>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  Object.entries(rules).forEach(([fieldName, validation]) => {
    const result = validateField(formData[fieldName], validation);
    if (!result.valid && result.error) {
      errors[fieldName] = result.error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== APPLICATION-SPECIFIC VALIDATION (Keep the existing working code) =====

export type ApplicationType = 'New' | 'Renew';
export type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';

export interface ApplicationFormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: CivilStatus;
}

export const validateApplicationStep = (
  formData: ApplicationFormData,
  currentStep: number,
  documentRequirements: DocumentRequirement[] = [],
  selectedDocuments: SelectedDocuments = {},
  getUploadState?: (docKey: string) => { uploading?: boolean; error?: string | null; success?: boolean; queued?: boolean }
): { isValid: boolean; errors: Partial<ApplicationFormData> } => {
  const newErrors: Partial<ApplicationFormData> = {};
  
  switch (currentStep) {
    case 0:
      // Application type validation (no errors expected here)
      if (!formData.applicationType) {
        // This shouldn't happen as it defaults to 'New', but just in case
        // We can't assign string to ApplicationType, so we'll handle this differently
        return { isValid: false, errors: { ...newErrors, position: 'Please select an application type' } };
      }
      break;
      
    case 1:
      // Job category validation
      if (!formData.jobCategory) {
        newErrors.jobCategory = 'Please select a job category';
      }
      break;
      
    case 2:
      // Personal details validation
      if (!formData.position.trim()) {
        newErrors.position = 'Position is required';
      }
      if (!formData.organization.trim()) {
        newErrors.organization = 'Organization is required';
      }
      break;
      
    case 3:
      // Document upload validation with queue checking
      const requiredDocuments = documentRequirements.filter(doc => doc.required);
      
      // Check for missing required documents
      const missingDocuments = requiredDocuments.filter(doc => {
        const uploadState = getUploadState ? getUploadState(doc.fieldName) : null;
        // Document is missing if it's not queued and not successfully uploaded
        return !uploadState || (!uploadState.queued && !uploadState.success);
      });
      
      if (missingDocuments.length > 0) {
        // Don't show alert here - let the caller handle it
        return { isValid: false, errors: newErrors };
      }
      
      // Check for upload errors that need to be fixed
      if (getUploadState) {
        const documentsWithErrors = documentRequirements.filter(doc => {
          const uploadState = getUploadState(doc.fieldName);
          return uploadState?.error;
        });
        
        if (documentsWithErrors.length > 0) {
          // Don't show alert here - let the caller handle it
          return { isValid: false, errors: newErrors };
        }
        
        // Check for currently uploading documents (should prevent navigation during upload)
        const uploadingDocuments = documentRequirements.filter(doc => {
          const uploadState = getUploadState(doc.fieldName);
          return uploadState?.uploading;
        });
        
        if (uploadingDocuments.length > 0) {
          return { isValid: false, errors: newErrors };
        }
      }
      break;
      
    case 4:
      // Final review validation
      if (!validateFormData(formData)) {
        return { isValid: false, errors: newErrors };
      }
      
      // Additional validation for required documents in review step
      const allRequiredDocuments = documentRequirements.filter(doc => doc.required);
      const finalMissingDocuments = allRequiredDocuments.filter(doc => {
        const uploadState = getUploadState ? getUploadState(doc.fieldName) : null;
        return !uploadState || (!uploadState.queued && !uploadState.success);
      });
      
      if (finalMissingDocuments.length > 0) {
        return { isValid: false, errors: newErrors };
      }
      break;
  }
  
  return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
};

export const validateFormData = (formData: ApplicationFormData): boolean => {
  return !!(
    formData.applicationType &&
    formData.jobCategory &&
    formData.position.trim() &&
    formData.organization.trim() &&
    formData.civilStatus
  );
};