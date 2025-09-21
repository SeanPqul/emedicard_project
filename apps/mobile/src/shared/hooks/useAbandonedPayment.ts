import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../backend/convex/_generated/api';
import { Id } from '../../../../backend/convex/_generated/dataModel';

interface UseAbandonedPaymentOptions {
  applicationId: Id<"applications"> | null;
  autoCheck?: boolean;
  checkInterval?: number; // milliseconds
}

export const useAbandonedPayment = ({
  applicationId,
  autoCheck = true,
  checkInterval = 5000, // Check every 5 seconds
}: UseAbandonedPaymentOptions) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<number | null>(null);

  // Query latest payment for application
  const latestPayment = useQuery(
    api.payments.maya.abandonedPayments.getLatestPaymentForApplication,
    applicationId ? { applicationId } : "skip"
  );

  // Mutation to handle abandoned payment
  const handleAbandoned = useMutation(
    api.payments.maya.abandonedPayments.handleAbandonedPayment
  );

  // Check if payment is abandoned when component using this hook gains focus
  const checkAndHandleAbandoned = useCallback(async () => {
    if (!latestPayment || !latestPayment.isAbandoned) {
      return { handled: false, reason: 'Payment not abandoned' };
    }

    setIsChecking(true);
    try {
      const result = await handleAbandoned({
        paymentId: latestPayment.paymentId,
        reason: "User returned without completing payment",
      });

      setLastCheckTime(Date.now());
      return { handled: true, result };
    } catch (error) {
      console.error('Error handling abandoned payment:', error);
      return { 
        handled: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      setIsChecking(false);
    }
  }, [latestPayment, handleAbandoned]);

  // Auto-check for abandoned payments
  useEffect(() => {
    if (!autoCheck || !latestPayment || !latestPayment.isProcessing) {
      return;
    }

    // Don't check too frequently
    if (lastCheckTime && Date.now() - lastCheckTime < checkInterval) {
      return;
    }

    const checkTimer = setInterval(() => {
      if (latestPayment.isAbandoned) {
        checkAndHandleAbandoned();
      }
    }, checkInterval);

    return () => clearInterval(checkTimer);
  }, [autoCheck, latestPayment, checkInterval, lastCheckTime, checkAndHandleAbandoned]);

  return {
    // State
    latestPayment,
    isChecking,
    isAbandoned: latestPayment?.isAbandoned || false,
    isProcessing: latestPayment?.isProcessing || false,
    paymentStatus: latestPayment?.status,
    paymentAge: latestPayment?.ageInMinutes,
    
    // Actions
    checkAndHandleAbandoned,
    cancelPayment: async () => {
      if (!latestPayment || !latestPayment.paymentId) {
        return { success: false, error: 'No payment to cancel' };
      }

      try {
        const result = await handleAbandoned({
          paymentId: latestPayment.paymentId,
          reason: "Cancelled by user",
        });
        return { success: true, result };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    },
  };
};
