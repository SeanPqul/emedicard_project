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
  return convex.query(api.requirements.getJobCategoryRequirements, { jobCategoryId });
}

/**
 * Create job category requirement
 */
export async function createJobCategoryRequirement(input: {
  jobCategoryId: Id<'jobCategory'>;
  documentRequirementId: Id<'documentRequirements'>;
  required: boolean;
}) {
  return convex.mutation(api.requirements.createJobCategoryRequirementMutation, input);
}

/**
 * Get form documents (basic list)
 */
export async function getFormDocuments(formId: Id<'forms'>) {
  return convex.query(api.requirements.getFormDocuments, { formId });
}

/**
 * Get form documents with comprehensive requirements info
 */
export async function getFormDocumentsWithRequirements(formId: Id<'forms'>) {
  return convex.query(api.requirements.getFormDocumentsWithRequirements, { formId });
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
  return convex.mutation(api.requirements.uploadDocument, input);
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
  return convex.mutation(api.requirements.updateDocumentField, input);
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: Id<'documents'>) {
  return convex.mutation(api.requirements.deleteDocumentMutation, { documentId });
}

/**
 * Get document URL
 */
export async function getDocumentUrl(storageId: string) {
  return convex.query(api.requirements.getDocumentUrl, { storageId });
}

/**
 * Admin: Review document
 */
export async function adminReviewDocument(documentId: Id<'documents'>, status: string, comments?: string) {
  return convex.mutation(api.requirements.adminReviewDocumentMutation, { documentId, status, comments });
}

/**
 * Admin: Get pending documents
 */
export async function adminGetPendingDocuments() {
  return convex.query(api.requirements.adminGetPendingDocumentsQuery, {});
}

/**
 * Admin: Get documents by status
 */
export async function adminGetDocumentsByStatus(status: string) {
  return convex.query(api.requirements.adminGetDocumentsByStatusQuery, { status });
}

/**
 * Admin: Batch review documents
 */
export async function adminBatchReviewDocuments(documentIds: Id<'documents'>[], status: string, comments?: string) {
  return convex.mutation(api.requirements.adminBatchReviewDocumentsMutation, { documentIds, status, comments });
}
