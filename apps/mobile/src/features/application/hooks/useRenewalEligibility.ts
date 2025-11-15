import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';

/**
 * Hook to check if user is eligible for renewal
 * Returns eligibility status and previous card/application data
 */
export function useRenewalEligibility() {
  const eligibilityData = useQuery(
    api.applications.checkRenewalEligibility.checkRenewalEligibilityQuery
  );

  return {
    isEligible: eligibilityData?.isEligible ?? false,
    reason: eligibilityData?.reason ?? '',
    previousCard: eligibilityData?.previousCard ?? null,
    previousApplication: eligibilityData?.previousApplication ?? null,
    isLoading: eligibilityData === undefined,
  };
}
