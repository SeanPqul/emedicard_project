import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import type { RejectionError } from '../types';

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
