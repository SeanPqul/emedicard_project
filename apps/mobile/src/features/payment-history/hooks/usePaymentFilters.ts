import { useMemo, useState } from 'react';
import { PaymentWithDetails, PaymentStatus } from './usePaymentHistory';

export type PaymentFilterStatus = 'all' | PaymentStatus;

export function usePaymentFilters(payments: PaymentWithDetails[]) {
  const [selectedStatus, setSelectedStatus] = useState<PaymentFilterStatus>('all');

  // Filter payments by status
  const filteredPayments = useMemo(() => {
    if (selectedStatus === 'all') {
      return payments;
    }
    return payments.filter(payment => payment.status === selectedStatus);
  }, [payments, selectedStatus]);

  // Sort by date (newest first)
  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => b._creationTime - a._creationTime);
  }, [filteredPayments]);

  // Get counts for each filter
  const filterCounts = useMemo(() => {
    const counts = {
      all: payments.length,
      Complete: 0,
      Pending: 0,
      Failed: 0,
      Processing: 0,
      Refunded: 0,
      Cancelled: 0,
      Expired: 0,
    };

    payments.forEach(payment => {
      counts[payment.status]++;
    });

    return counts;
  }, [payments]);

  return {
    selectedStatus,
    setSelectedStatus,
    filteredPayments: sortedPayments,
    filterCounts,
  };
}
