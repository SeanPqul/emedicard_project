import { Id } from '@backend/convex/_generated/dataModel';
import { DocumentStatus } from './rejection-types';

/**
 * Document upload interface
 * Represents a document uploaded for an application
 */
export interface DocumentUpload {
  _id: Id<"documentUploads">;
  applicationId: Id<"applications">;
  documentTypeId: Id<"documentTypes">;
  storageFileId: Id<"_storage">;
  originalFileName: string;
  uploadedAt: number;
  reviewStatus: string;
  
  // Rejection tracking
  rejectionHistoryId?: Id<"documentRejectionHistory">;
  hasActiveRejection?: boolean;
  rejectionAttempts?: number;
  
  // Metadata
  metadata?: {
    width?: number;
    height?: number;
    pages?: number;
    duration?: number; // For videos
  };
}

/**
 * Document type definition
 * Defines what documents are required for each job category
 */
export interface DocumentType {
  _id: Id<"documentTypes">;
  name: string;
  description: string;
  icon: string;
  isRequired: boolean;
  fieldIdentifier: string;
}

/**
 * Document requirement interface
 * Links job categories to required document types
 */
export interface DocumentRequirement {
  _id: Id<"jobCategoryDocuments">;
  jobCategoryId: Id<"jobCategories">;
  documentTypeId: Id<"documentTypes">;
  isRequired: boolean;
}

/**
 * Document upload with enriched data
 */
export interface EnrichedDocumentUpload extends DocumentUpload {
  documentTypeName: string;
  documentTypeDescription: string;
  isRequired: boolean;
  statusLabel: string;
  statusColor: string;
}

/**
 * Document collection by type
 */
export interface DocumentsByType {
  documentType: DocumentType;
  uploads: DocumentUpload[];
  hasRejection: boolean;
  isComplete: boolean;
}
