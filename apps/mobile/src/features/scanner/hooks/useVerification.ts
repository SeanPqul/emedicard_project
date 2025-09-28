import { useQuery, useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

type ConvexId<T extends string> = Id<T>;

export function useVerification(healthCardId?: string) {
  const verificationLogs = useQuery(
    api.verification.getVerificationLogsByHealthCard.getVerificationLogsByHealthCardQuery,
    healthCardId ? { healthCardId: healthCardId as ConvexId<'healthCards'> } : "skip"
  );
  const userVerificationLogs = useQuery(api.verification.getVerificationLogsByUser.getVerificationLogsByUserQuery, {});
  const verificationStats = useQuery(api.verification.getVerificationStats.getVerificationStatsQuery, {});

  const createVerificationLogMutation = useMutation(api.verification.createVerificationLog.createVerificationLogMutation);
  const logQRScanMutation = useMutation(api.verification.logQRScan.logQRScanMutation);
  const logVerificationAttemptMutation = useMutation(api.verification.logVerificationAttempt.logVerificationAttemptMutation);

  const createVerificationLog = async (input: {
    healthCardId: ConvexId<'healthCards'>;
    location?: string;
    metadata?: Record<string, any>;
  }) => {
    return createVerificationLogMutation(input);
  };

  const logQRScan = async (input: {
    healthCardId: ConvexId<'healthCards'>;
    location?: string;
    scanResult: string;
  }) => {
    return logQRScanMutation(input);
  };

  const logVerificationAttempt = async (input: {
    healthCardId: ConvexId<'healthCards'>;
    success: boolean;
    errorMessage?: string;
  }) => {
    return logVerificationAttemptMutation(input);
  };

  return {
    data: {
      verificationLogs,
      userVerificationLogs,
      verificationStats,
    },
    isLoading: healthCardId ? verificationLogs === undefined : false,
    isLoadingUserLogs: userVerificationLogs === undefined,
    isLoadingStats: verificationStats === undefined,
    
    
    mutations: {
      createVerificationLog,
      logQRScan,
      logVerificationAttempt,
    }
  };
}