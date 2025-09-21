/**
 * ReviewStep Types
 * 
 * Type definitions for the review and submit step component
 */

import { JobCategory, DocumentRequirement } from '@entities/application/model/types';
import { SelectedDocuments } from '@/src/types';

export type ApplicationType = 'New' | 'Renew';

export interface ApplicationFormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';
}

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
