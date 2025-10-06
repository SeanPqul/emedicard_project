import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import type { RejectionError } from '../types';

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
