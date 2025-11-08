import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

/**
 * Hook to get count of referred/flagged documents for a user
 * Uses new backend query with dual-read pattern
 * Returns separate counts for medical referrals vs document issues
 */
export function useReferredDocumentsCount(userId: Id<"users"> | undefined) {
  const data = useQuery(
    api.documents.referralQueries.getReferredDocumentsCount,
    userId ? { userId } : 'skip'
  );

  return {
    // Total counts
    totalIssues: data?.totalIssues || 0,
    pendingResubmission: data?.pendingResubmission || 0,

    // Breakdown by type
    medicalReferrals: data?.medicalReferrals || 0,
    documentIssues: data?.documentIssues || 0,

    // Application count
    applications: data?.applications || 0,

    // Loading state
    isLoading: data === undefined,
    error: null,
  };
}
