import { convex } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Requirements API Module
 * 
 * Feature-scoped API functions for document requirements and reviews.
 * Each function is small, focused, and uses Id types.
 */

/**
 * Get requirements by job category
 */
export async function getRequirementsByJobCategory(jobCategoryId: Id<'jobCategories'>) {
  return convex.query(api.requirements.getRequirementsByJobCategory, { jobCategoryId });
}

/**
 * Get category requirements
 */
export async function getCategoryRequirements(categoryId: Id<'jobCategories'>) {
  return convex.query(api.requirements.getCategoryRequirements, { categoryId });
}

/**
 * Get form documents
 */
export async function getFormDocuments(formId: Id<'forms'>) {
  return convex.query(api.requirements.getFormDocuments, { formId });
}

/**
 * Get form documents by ID
 */
export async function getFormDocumentsById(formId: Id<'forms'>) {
  return convex.query(api.requirements.getFormDocumentsById, { formId });
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
 * Update document
 */
export async function updateDocument(documentId: Id<'documents'>, updates: {
  metadata?: Record<string, any>;
  documentType?: string;
}) {
  return convex.mutation(api.requirements.updateDocument, { documentId, ...updates });
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: Id<'documents'>) {
  return convex.mutation(api.requirements.deleteDocument, { documentId });
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
  return convex.mutation(api.requirements.adminReviewDocument, { documentId, status, comments });
}

/**
 * Admin: Get pending documents
 */
export async function adminGetPendingDocuments() {
  return convex.query(api.requirements.adminGetPendingDocuments, {});
}

/**
 * Admin: Get documents by status
 */
export async function adminGetDocumentsByStatus(status: string) {
  return convex.query(api.requirements.adminGetDocumentsByStatus, { status });
}

/**
 * Admin: Batch review documents
 */
export async function adminBatchReviewDocuments(documentIds: Id<'documents'>[], status: string, comments?: string) {
  return convex.mutation(api.requirements.adminBatchReviewDocuments, { documentIds, status, comments });
}
