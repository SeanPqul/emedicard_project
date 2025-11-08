import { useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { ApiResponse } from '../../../types/utility';

/**
 * Mutation to resubmit a document
 * Phase 4 Migration: Updated terminology to support both referrals and document issues
 */
export function useResubmitDocument() {
  const mutation = useMutation(api.requirements.resubmitDocument.resubmitDocument);

  const friendlyMessage = (err: unknown): string => {
    const raw = err instanceof Error ? err.message : String(err ?? '');
    const m = raw.toLowerCase();
    // Phase 4 Migration: Updated error messages
    if (m.includes('no rejection found') || m.includes('no referral found') || m.includes('no issue found')) {
      return "This document isn't marked for resubmission yet. Please refresh and try again.";
    }
    if (m.includes('not authenticated')) {
      return 'Your session expired. Please sign in again and retry.';
    }
    if (m.includes('permission') || m.includes('insufficient')) {
      return 'You don’t have permission to perform this action.';
    }
    return 'We couldn’t resubmit your document. Please try again.';
  };

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
      return {
        success: false,
        error: friendlyMessage(error),
      };
    }
  };

  return { resubmitDocument };
}
