import { useMutation, useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
type PaymentMethod = 'Maya' | 'BaranggayHall' | 'CityHall';

export function usePayments(applicationId?: string) {
  const existingPayment = useQuery(
    api.payments.getPaymentByFormId.getPaymentByApplicationIdQuery, 
    applicationId ? { applicationId: applicationId as Id<"applications"> } : "skip"
  );
  const userPayments = useQuery(api.payments.getUserPayments.getUserPaymentsQuery);

  const createPaymentMutation = useMutation(api.payments.createPayment.createPaymentMutation);
  const updatePaymentStatusMutation = useMutation(api.payments.updatePaymentStatus.updatePaymentStatusMutation);
  const generateUploadUrlMutation = useMutation(api.storage.generateUploadUrl.generateUploadUrlMutation);

  const createPayment = async (input: {
    applicationId: Id<'applications'>;
    amount: number;
    serviceFee: number;
    netAmount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    receiptStorageId?: Id<'_storage'>;
  }) => {
    return createPaymentMutation(input);
  };

  const updatePaymentStatus = async (
    paymentId: Id<'payments'>, 
    status: 'Pending' | 'Complete' | 'Failed'
  ) => {
    return updatePaymentStatusMutation({ paymentId, paymentStatus: status });
  };

  const generateUploadUrl = async () => {
    return generateUploadUrlMutation({});
  };

  return {
    data: {
      existingPayment,
      userPayments,
    },
    isLoading: applicationId ? existingPayment === undefined : userPayments === undefined,
    isLoadingApplicationPayment: applicationId ? existingPayment === undefined : false,
    
    mutations: {
      createPayment,
      updatePaymentStatus,
      generateUploadUrl,
    }
  };
}