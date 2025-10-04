import { ApplicationFormData } from '../ApplicationTypeStep';
import { DocumentRequirement } from '@/src/entities/application';
import { SelectedDocuments } from '@shared/types';

export interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  queued: boolean;
}

export interface UploadDocumentsStepProps {
  formData: ApplicationFormData;
  requirementsByJobCategory: DocumentRequirement[];
  selectedDocuments: SelectedDocuments;
  isLoading: boolean;
  getUploadState: (documentId: string) => UploadState;
  onDocumentPicker: (documentId: string) => void;
  onRemoveDocument: (documentId: string) => void;
  requirements?: any;
}
