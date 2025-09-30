import { useMutation, useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

export function useVerification(healthCardId?: string) {
  const verificationLogs = useQuery(
    api.verification.getVerificationLogsByHealthCard.getVerificationLogsByHealthCardQuery,
    healthCardId ? { healthCardId: healthCardId as Id<'healthCards'> } : "skip"
  );
  const userVerificationLogs = useQuery(api.verification.getVerificationLogsByUser.getVerificationLogsByUserQuery, {});
  const verificationStats = useQuery(api.verification.getVerificationStats.getVerificationStatsQuery, 
    healthCardId ? { healthCardId: healthCardId as Id<'healthCards'> } : "skip"
  );

  const createVerificationLogMutation = useMutation(api.verification.createVerificationLog.createVerificationLogMutation);
  const logQRScanMutation = useMutation(api.verification.logQRScan.logQRScanMutation);
  const logVerificationAttemptMutation = useMutation(api.verification.logVerificationAttempt.logVerificationAttemptMutation);

  const createVerificationLog = async (input: {
    healthCardId: Id<'healthCards'>;
    location?: string;
    metadata?: Record<string, any>;
  }) => {
    return createVerificationLogMutation(input);
  };

  const logQRScan = async (input: {
    verificationToken: string;
    userAgent?: string;
    ipAddress?: string;
    scanLocation?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    deviceInfo?: {
      platform: string;
      deviceId: string;
      appVersion: string;
    };
  }) => {
    return logQRScanMutation(input);
  };

  const logVerificationAttempt = async (input: {
    verificationToken: string;
    success: boolean;
    userAgent?: string;
    ipAddress?: string;
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