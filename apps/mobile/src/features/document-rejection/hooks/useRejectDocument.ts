import { useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { RejectionCategory } from '@entities/document';
import { ApiResponse } from '../../../types/utility';

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
