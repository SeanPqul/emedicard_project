import { useQuery, useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { 
  GetRejectionHistoryResponse, 
  GetRejectedDocumentsCountResponse, 
  GetDocumentRejectionDetailsResponse,
  RejectionCategory,
  EnrichedRejectionHistory
} from '../model/rejection-types';
import { ApiResponse } from '../../../types/utility';

/**
 * Error types for rejection operations
 */
export interface RejectionError {
  code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'SERVER_ERROR';
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Hook to fetch rejection history for an application
 */
export function useRejectionHistory(applicationId: Id<"applications"> | undefined) {
  const data = useQuery(
    api.documents.rejectionQueries.getRejectionHistory,
    applicationId ? { applicationId } : 'skip'
  );

  return {
    rejections: data || [],
    totalCount: data?.length || 0,
    isLoading: data === undefined,
    error: null as RejectionError | null,
  };
}

/**
 * Hook to get count of rejected documents for a user
 */
export function useRejectedDocumentsCount(userId: Id<"users"> | undefined) {
  const data = useQuery(
    api.documents.rejectionQueries.getRejectedDocumentsCount,
    userId ? { userId } : 'skip'
  );

  return {
    count: data?.pendingResubmission || 0,
    totalRejected: data?.totalRejected || 0,
    isLoading: data === undefined,
    error: null as RejectionError | null,
  };
}

/**
 * Hook to get detailed rejection information for a document
 */
export function useDocumentRejectionDetails(
  applicationId: Id<"applications"> | undefined,
  documentTypeId: Id<"documentTypes"> | undefined
) {
  const data = useQuery(
    api.documents.rejectionQueries.getDocumentRejectionDetails,
    applicationId && documentTypeId ? { applicationId, documentTypeId } : 'skip'
  );

  return {
    rejection: data,
    isLoading: data === undefined,
    error: null as RejectionError | null,
  };
}

/**
 * Hook for admin to fetch resubmission queue
 */
export function useResubmissionQueue() {
  const data = useQuery(api.documents.rejectionQueries.getResubmissionQueue);

  return {
    queue: data || [],
    totalCount: data?.length || 0,
    isLoading: data === undefined,
    error: null as RejectionError | null,
  };
}

/**
 * Mutation to reject a document (admin only)
 */
export function useRejectDocument() {
  const mutation = useMutation(api.admin.documents.rejectDocument.rejectDocument);

  const rejectDocument = async (params: {
    documentUploadId: Id<"documentUploads">;
    rejectionCategory: RejectionCategory;
    rejectionReason: string;
    specificIssues: string[];
  }): Promise<ApiResponse<{ rejectionId: Id<"documentRejectionHistory"> }>> => {
    try {
      const result = await mutation(params);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Failed to reject document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject document',
      };
    }
  };

  return { rejectDocument };
}

/**
 * Mutation to resubmit a document
 */
export function useResubmitDocument() {
  const mutation = useMutation(api.requirements.resubmitDocument.resubmitDocument);

  const resubmitDocument = async (params: {
    applicationId: Id<"applications">;
    documentTypeId: Id<"documentTypes">;
    storageId: Id<"_storage">;
    fileName: string;
    fileType: string;
    fileSize: number;
  }): Promise<ApiResponse<{ uploadId: Id<"documentUploads">; message: string; applicationStatus: string }>> => {
    try {
      const result = await mutation(params);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Failed to resubmit document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resubmit document',
      };
    }
  };

  return { resubmitDocument };
}

/**
 * Utility function to check if a document has active rejections
 */
export function hasActiveRejection(rejection: EnrichedRejectionHistory | null): boolean {
  return !!rejection && !rejection.wasReplaced;
}

/**
 * Utility function to calculate rejection rate
 */
export function calculateRejectionRate(
  totalDocuments: number,
  rejectedDocuments: number
): number {
  if (totalDocuments === 0) return 0;
  return Math.round((rejectedDocuments / totalDocuments) * 100);
}

/**
 * Utility function to format rejection date
 */
export function formatRejectionDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Utility function to get rejection severity
 */
export function getRejectionSeverity(category: RejectionCategory): 'high' | 'medium' | 'low' {
  const highSeverity: RejectionCategory[] = [
    RejectionCategory.INVALID_DOCUMENT,
    RejectionCategory.WRONG_DOCUMENT,
    RejectionCategory.EXPIRED_DOCUMENT,
  ];
  
  const mediumSeverity: RejectionCategory[] = [
    RejectionCategory.INCOMPLETE_DOCUMENT,
    RejectionCategory.QUALITY_ISSUE,
  ];

  if (highSeverity.includes(category)) return 'high';
  if (mediumSeverity.includes(category)) return 'medium';
  return 'low';
}
