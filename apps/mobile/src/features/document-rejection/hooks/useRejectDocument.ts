import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { RejectionCategory } from '@entities/document';
import { useMutation } from 'convex/react';
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
      if (!result || !result.rejectionId) {
        return {
          success: false,
          error: 'Rejection ID was not returned by the server',
        };
      }
      return {
        success: true,
        data: { rejectionId: result.rejectionId },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject document',
      };
    }
  };

  return { rejectDocument };
}
