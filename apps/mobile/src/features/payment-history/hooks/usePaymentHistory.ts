import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';

export type PaymentStatus = 'Pending' | 'Processing' | 'Complete' | 'Failed' | 'Refunded' | 'Cancelled' | 'Expired';

export interface PaymentWithDetails {
  _id: string;
  _creationTime: number;
  amount: number;
  serviceFee: number;
  netAmount: number;
  paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall';
  referenceNumber: string;
  status: PaymentStatus;
  updatedAt?: number;
  application: {
    _id: string;
    applicationType: 'New' | 'Renew';
    position: string;
    organization: string;
  };
  jobCategory?: {
    _id: string;
    name: string;
    colorCode: string;
  };
}

export function usePaymentHistory() {
  const payments = useQuery(api.payments.getUserPayments.getUserPaymentsQuery, {});
  
  return {
    payments: (payments || []) as PaymentWithDetails[],
    isLoading: payments === undefined,
    isEmpty: payments?.length === 0,
  };
}
