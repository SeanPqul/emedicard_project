import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import type { RejectionError } from '../types';

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
