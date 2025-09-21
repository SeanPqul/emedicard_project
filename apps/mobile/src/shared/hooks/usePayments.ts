import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../backend/convex/_generated/api';
import { Id } from '../../../../backend/convex/_generated/dataModel';

type ConvexId<T extends string> = Id<T>;
type PaymentMethod = 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall';

export function usePayments(applicationId?: string) {
  const existingPayment = useQuery(
    api.payments.getPaymentByFormId.getPaymentByApplicationIdQuery, 
    applicationId ? { applicationId: applicationId as ConvexId<"applications"> } : "skip"
  );
  const userPayments = useQuery(api.payments.getUserPayments.getUserPaymentsQuery);

  const createPaymentMutation = useMutation(api.payments.createPayment.createPaymentMutation);
  const updatePaymentStatusMutation = useMutation(api.payments.updatePaymentStatus.updatePaymentStatusMutation);
  const generateUploadUrlMutation = useMutation(api.storage.generateUploadUrl.generateUploadUrlMutation);

  const createPayment = async (input: {
    applicationId: ConvexId<'applications'>;
    amount: number;
    serviceFee: number;
    netAmount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    receiptStorageId?: ConvexId<'_storage'>;
  }) => {
    return createPaymentMutation(input);
  };

  const updatePaymentStatus = async (
    paymentId: ConvexId<'payments'>, 
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