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
  getUploadState?: (docKey: string) => { uploading?: boolean; error?: string | null }
): { isValid: boolean; errors: Partial<ApplicationFormData> } => {
  const newErrors: Partial<ApplicationFormData> = {};
  
  switch (currentStep) {
    case 0:
      break;
      
    case 1:
      if (!formData.jobCategory) {
        newErrors.jobCategory = 'Please select a job category';
      }
      break;
      
    case 2:
      if (!formData.position.trim()) {
        newErrors.position = 'Position is required';
      }
      if (!formData.organization.trim()) {
        newErrors.organization = 'Organization is required';
      }
      break;
      
    case 3:
      const requiredDocuments = documentRequirements.filter(doc => doc.required);
      const missingDocuments = requiredDocuments.filter(doc => !selectedDocuments[doc.fieldName]);
      
      if (missingDocuments.length > 0) {
        Alert.alert(
          'Missing Required Documents',
          `Please upload the following required documents: ${missingDocuments.map(doc => doc.name).join(', ')}`,
          [{ text: 'OK' }]
        );
        return { isValid: false, errors: newErrors };
      }
      
      if (getUploadState) {
        const documentsWithErrors = Object.keys(selectedDocuments).filter(docKey => 
          getUploadState(docKey)?.error
        );
        
        if (documentsWithErrors.length > 0) {
          Alert.alert('Upload Errors', 'Please fix the upload errors before proceeding.', [{ text: 'OK' }]);
          return { isValid: false, errors: newErrors };
        }
      }
      break;
      
    case 4:
      if (!validateFormData(formData)) {
        Alert.alert('Incomplete Application', 'Please ensure all required fields are completed.', [{ text: 'OK' }]);
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