/**
 * ReviewStep Types
 * 
 * Type definitions for the review and submit step component
 */

import { JobCategory, DocumentRequirement } from '@/src/entities/application';
import { SelectedDocuments } from '@shared/types';
import { ApplicationFormData } from '../../../lib/validation';

export interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  queued: boolean;
}

export interface ReviewStepProps {
  formData: ApplicationFormData;
  jobCategoriesData: JobCategory[];
  requirementsByJobCategory: DocumentRequirement[];
  selectedDocuments: SelectedDocuments;
  getUploadState: (documentId: string) => UploadState;
  onEditStep: (step: number) => void;
  termsAccepted: boolean;
  onTermsAcceptedChange: (accepted: boolean) => void;
}

export interface DocumentStatusInfo {
  document: DocumentRequirement;
  isUploaded: boolean;
  hasError: boolean;
  isUploading: boolean;
  fileName?: string;
}

export interface ApplicationSummary {
  formData: ApplicationFormData;
  selectedCategory?: JobCategory;
  uploadedDocuments: DocumentRequirement[];
  missingDocuments: DocumentRequirement[];
  documentsWithErrors: string[];
  totalFee: number;
  applicationFee: number;
  processingFee: number;
}
