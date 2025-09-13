/**
 * Application-Specific Validation
 * 
 * Validation logic specific to health card applications
 */

import { ApplicationType, CivilStatus, DocumentRequirement } from '@emedicard/types';
import { FormValidationResult, validateField } from './validators';

// ===== APPLICATION FORM TYPES =====
export interface ApplicationFormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: CivilStatus;
}

export interface DocumentUploadState {
  uploading?: boolean;
  error?: string | null;
  success?: boolean;
  queued?: boolean;
}

export interface ApplicationValidationOptions {
  documentRequirements?: DocumentRequirement[];
  getUploadState?: (docKey: string) => DocumentUploadState;
}

// ===== APPLICATION FORM VALIDATION =====
export const validateApplicationForm = (
  formData: ApplicationFormData
): FormValidationResult<ApplicationFormData> => {
  const errors: Partial<ApplicationFormData> = {};

  // Application type validation
  if (!formData.applicationType) {
    (errors as any).applicationType = 'Please select an application type';
  }

  // Job category validation
  if (!formData.jobCategory) {
    errors.jobCategory = 'Please select a job category';
  }

  // Position validation
  if (!formData.position || !formData.position.trim()) {
    errors.position = 'Position is required';
  } else if (formData.position.trim().length < 2) {
    errors.position = 'Position must be at least 2 characters long';
  }

  // Organization validation
  if (!formData.organization || !formData.organization.trim()) {
    errors.organization = 'Organization is required';
  } else if (formData.organization.trim().length < 2) {
    errors.organization = 'Organization must be at least 2 characters long';
  }

  // Civil status validation
  if (!formData.civilStatus) {
    (errors as any).civilStatus = 'Please select your civil status';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== STEP-BY-STEP VALIDATION =====
export const validateApplicationStep = (
  formData: ApplicationFormData,
  currentStep: number,
  options: ApplicationValidationOptions = {}
): FormValidationResult<ApplicationFormData> => {
  const { documentRequirements = [], getUploadState } = options;
  const errors: Partial<ApplicationFormData> = {};

  switch (currentStep) {
    case 0:
      // Application type validation
      if (!formData.applicationType) {
        (errors as any).applicationType = 'Please select an application type';
      }
      break;

    case 1:
      // Job category validation
      if (!formData.jobCategory) {
        errors.jobCategory = 'Please select a job category';
      }
      break;

    case 2:
      // Personal details validation
      if (!formData.position || !formData.position.trim()) {
        errors.position = 'Position is required';
      }
      if (!formData.organization || !formData.organization.trim()) {
        errors.organization = 'Organization is required';
      }
      if (!formData.civilStatus) {
        (errors as any).civilStatus = 'Please select your civil status';
      }
      break;

    case 3:
      // Document upload validation
      if (getUploadState) {
        const validationResult = validateDocumentUploads(documentRequirements, getUploadState);
        if (!validationResult.isValid) {
          return { isValid: false, errors: {} };
        }
      }
      break;

    case 4:
      // Final review validation
      const formValidation = validateApplicationForm(formData);
      if (!formValidation.isValid) {
        return formValidation;
      }

      // Final document validation
      if (getUploadState) {
        const documentValidation = validateDocumentUploads(documentRequirements, getUploadState);
        if (!documentValidation.isValid) {
          return { isValid: false, errors: {} };
        }
      }
      break;

    default:
      return { isValid: false, errors: {} };
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== DOCUMENT VALIDATION =====
export const validateDocumentUploads = (
  documentRequirements: DocumentRequirement[],
  getUploadState: (docKey: string) => DocumentUploadState
): { isValid: boolean; missingDocuments: DocumentRequirement[]; errorDocuments: DocumentRequirement[]; uploadingDocuments: DocumentRequirement[] } => {
  const requiredDocuments = documentRequirements.filter(doc => doc.required);

  // Check for missing required documents
  const missingDocuments = requiredDocuments.filter(doc => {
    const uploadState = getUploadState(doc.fieldName);
    return !uploadState || (!uploadState.queued && !uploadState.success);
  });

  // Check for documents with errors
  const errorDocuments = documentRequirements.filter(doc => {
    const uploadState = getUploadState(doc.fieldName);
    return uploadState?.error;
  });

  // Check for currently uploading documents
  const uploadingDocuments = documentRequirements.filter(doc => {
    const uploadState = getUploadState(doc.fieldName);
    return uploadState?.uploading;
  });

  const isValid = missingDocuments.length === 0 && errorDocuments.length === 0 && uploadingDocuments.length === 0;

  return {
    isValid,
    missingDocuments,
    errorDocuments,
    uploadingDocuments
  };
};

// ===== PAYMENT VALIDATION =====
export interface PaymentFormData {
  method: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall';
  referenceNumber: string;
  amount: number;
}

export const validatePaymentForm = (
  formData: PaymentFormData
): FormValidationResult<PaymentFormData> => {
  const errors: Partial<PaymentFormData> = {};

  // Payment method validation
  if (!formData.method) {
    (errors as any).method = 'Please select a payment method';
  }

  // Reference number validation
  if (!formData.referenceNumber || !formData.referenceNumber.trim()) {
    errors.referenceNumber = 'Reference number is required';
  } else {
    // Validate reference number format based on payment method
    const refNum = formData.referenceNumber.trim();
    
    if (formData.method === 'Gcash' || formData.method === 'Maya') {
      // Digital payment reference numbers are typically 10-15 characters alphanumeric
      if (refNum.length < 8 || refNum.length > 20) {
        errors.referenceNumber = 'Invalid reference number format';
      }
    }
  }

  // Amount validation
  if (!formData.amount || formData.amount <= 0) {
    (errors as any).amount = 'Amount must be greater than zero';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ===== UTILITY FUNCTIONS =====
export const isApplicationFormComplete = (formData: ApplicationFormData): boolean => {
  return !!(
    formData.applicationType &&
    formData.jobCategory &&
    formData.position &&
    formData.position.trim() &&
    formData.organization &&
    formData.organization.trim() &&
    formData.civilStatus
  );
};

export const getApplicationStepProgress = (
  formData: ApplicationFormData,
  currentStep: number,
  totalSteps: number = 5
): number => {
  let completedSteps = 0;

  // Step 0: Application type
  if (formData.applicationType) completedSteps++;

  // Step 1: Job category
  if (formData.jobCategory) completedSteps++;

  // Step 2: Personal details
  if (formData.position?.trim() && formData.organization?.trim() && formData.civilStatus) {
    completedSteps++;
  }

  // Step 3 and 4 require additional context (documents, etc.)
  if (currentStep >= 3) completedSteps = Math.max(completedSteps, 3);
  if (currentStep >= 4) completedSteps = Math.max(completedSteps, 4);

  return Math.round((completedSteps / totalSteps) * 100);
};