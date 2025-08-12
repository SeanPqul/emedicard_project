import { convex } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Requirements API Module
 * 
 * Feature-scoped API functions for document requirements operations.
 * Each function is small, focused, and uses Id types.
 */

/**
 * Get job category requirements
 */
export async function getJobCategoryRequirements(jobCategoryId: Id<'jobCategory'>) {
  return convex.query(api.requirements.getJobCategoryRequirements.getJobCategoryRequirementsQuery, { jobCategoryId });
}

/**
 * Create job category requirement
 */
export async function createJobCategoryRequirement(input: {
  jobCategoryId: Id<'jobCategory'>;
  documentRequirementId: Id<'documentRequirements'>;
  required: boolean;
}) {
  return convex.mutation(api.requirements.createJobCategoryRequirement.createJobCategoryRequirementMutation, input);
}

/**
 * Get form documents (basic list)
 */
export async function getFormDocuments(formId: Id<'forms'>) {
  return convex.query(api.requirements.getFormDocumentsRequirements.getFormDocumentsRequirementsQuery, { formId });
}

/**
 * Get form documents with comprehensive requirements info
 */
export async function getFormDocumentsWithRequirements(formId: Id<'forms'>) {
  return convex.query(api.requirements.getFormDocumentsRequirements.getFormDocumentsRequirementsQuery, { formId });
}

/**
 * Upload document
 */
export async function uploadDocument(input: {
  fileName: string;
  fileType: string;
  storageId: string;
  documentType: string;
  metadata?: Record<string, any>;
}) {
  return convex.mutation(api.requirements.uploadDocument.uploadDocumentMutation, input);
}

/**
 * Update document field (replacement document)
 */
export async function updateDocumentField(input: {
  formId: Id<'forms'>;
  fieldName: string;
  storageId: Id<'_storage'>;
  fileName: string;
  fileType: string;
  fileSize: number;
  status?: 'Pending' | 'Approved' | 'Rejected';
  reviewBy?: Id<'users'>;
  reviewAt?: number;
  remarks?: string;
}) {
  return convex.mutation(api.requirements.updateDocumentField.updateDocumentFieldMutation, input);
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: Id<'documents'>) {
  return convex.mutation(api.requirements.deleteDocument.deleteDocumentMutation, { documentId });
}

/**
 * Get document URL
 */
export async function getDocumentUrl(storageId: string) {
  return convex.query(api.requirements.getDocumentUrl.getDocumentUrlQuery, { storageId });
}

/**
 * Admin: Review document
 */
export async function adminReviewDocument(documentId: Id<'documents'>, status: string, comments?: string) {
  return convex.mutation(api.requirements.adminReviewDocument.adminReviewDocumentMutation, { documentId, status, comments });
}

/**
 * Admin: Get pending documents
 */
export async function adminGetPendingDocuments() {
  return convex.query(api.requirements.adminGetPendingDocuments.adminGetPendingDocumentsQuery, {});
}

/**
 * Admin: Get documents by status
 */
export async function adminGetDocumentsByStatus(status: string) {
  return convex.query(api.requirements.adminGetDocumentsByStatus.adminGetDocumentsByStatusQuery, { status });
}

/**
 * Admin: Batch review documents
 */
export async function adminBatchReviewDocuments(documentIds: Id<'documents'>[], status: string, comments?: string) {
  return convex.mutation(api.requirements.adminBatchReviewDocuments.adminBatchReviewDocumentsMutation, { documentIds, status, comments });
}
