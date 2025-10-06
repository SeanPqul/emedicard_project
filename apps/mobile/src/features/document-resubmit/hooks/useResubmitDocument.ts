import { useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { ApiResponse } from '../../../types/utility';

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
