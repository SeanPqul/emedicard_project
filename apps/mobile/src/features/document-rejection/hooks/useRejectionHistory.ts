import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import type { RejectionError } from '../types';

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
