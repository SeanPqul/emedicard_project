import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

type ConvexId<T extends string> = Id<T>;
type PaymentMethod = 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall';

export function usePayments(formId?: string) {
  const existingPayment = useQuery(
    api.payments.getPaymentByFormId.getPaymentByFormIdQuery, 
    formId ? { formId: formId as ConvexId<"forms"> } : "skip"
  );
  const userPayments = useQuery(api.payments.getUserPayments.getUserPaymentsQuery);

  const createPaymentMutation = useMutation(api.payments.createPayment.createPaymentMutation);
  const updatePaymentStatusMutation = useMutation(api.payments.updatePaymentStatus.updatePaymentStatusMutation);
  const generateUploadUrlMutation = useMutation(api.storage.generateUploadUrl.generateUploadUrlMutation);

  const createPayment = async (input: {
    formId: ConvexId<'forms'>;
    amount: number;
    serviceFee: number;
    netAmount: number;
    method: PaymentMethod;
    referenceNumber: string;
    receiptId?: ConvexId<'_storage'>;
  }) => {
    return createPaymentMutation(input);
  };

  const updatePaymentStatus = async (
    paymentId: ConvexId<'payments'>, 
    status: 'Pending' | 'Complete' | 'Failed'
  ) => {
    return updatePaymentStatusMutation({ paymentId, status });
  };

  const generateUploadUrl = async () => {
    return generateUploadUrlMutation({});
  };

  return {
    data: {
      existingPayment,
      userPayments,
    },
    isLoading: formId ? existingPayment === undefined : userPayments === undefined,
    isLoadingFormPayment: formId ? existingPayment === undefined : false,
    
    service: paymentsService,
    
    mutations: {
      createPayment,
      updatePaymentStatus,
      generateUploadUrl,
    }
  };
}