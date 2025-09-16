import { useQuery, useMutation } from 'convex/react';
import { ConvexId, apiEndpoints } from '../../shared/api';

/**
 * Payment Entity - Complete Domain Model
 */

// ===== TYPES =====
export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Refunded";
export type PaymentMethod = "Gcash" | "Maya" | "BaranggayHall" | "CityHall";

export interface Payment {
  _id: ConvexId<"payments">;
  applicationId: ConvexId<"applications">;
  userId: ConvexId<"users">;
  amount: number;
  serviceFee?: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  receiptId?: ConvexId<"_storage">;
  status: PaymentStatus;
  _creationTime: number;
}

export interface CreatePaymentInput {
  applicationId: ConvexId<"applications">;
  amount: number;
  serviceFee: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  receiptId?: ConvexId<"_storage">;
}

// ===== DOMAIN LOGIC =====
export const calculateServiceFee = (amount: number): number => {
  // Example service fee calculation - 5% of amount
  return Math.round(amount * 0.05 * 100) / 100;
};

export const calculateNetAmount = (amount: number, serviceFee: number): number => {
  return amount + serviceFee;
};

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  const colors = {
    "Pending": "#F59E0B",
    "Completed": "#10B981", 
    "Failed": "#EF4444",
    "Refunded": "#6B7280",
  };
  return colors[status];
};

export const isPaymentComplete = (payment: Payment): boolean => {
  return payment.status === "Completed";
};

// ===== API HOOKS =====
export const usePaymentByApplication = (applicationId?: string) => {
  const existingPayment = useQuery(
    apiEndpoints.payments.getByApplication || (() => null),
    applicationId ? { applicationId: applicationId as ConvexId<"applications"> } : "skip"
  );
  
  return {
    data: existingPayment as Payment | undefined,
    isLoading: applicationId ? existingPayment === undefined : false,
    error: null,
  };
};

export const useUserPayments = () => {
  const userPayments = useQuery(apiEndpoints.payments.getUserPayments || (() => null), {});
  
  return {
    data: userPayments as Payment[] | undefined,
    isLoading: userPayments === undefined,
    error: null,
  };
};

export const usePayments = (applicationId?: string) => {
  const { data: existingPayment, isLoading: isLoadingExisting } = usePaymentByApplication(applicationId);
  const { data: userPayments, isLoading: isLoadingUser } = useUserPayments();

  return {
    data: {
      existingPayment,
      userPayments,
    },
    isLoading: applicationId ? isLoadingExisting : isLoadingUser,
    isLoadingApplicationPayment: isLoadingExisting,
  };
};

export const useCreatePayment = () => {
  const createPaymentMutation = useMutation(apiEndpoints.payments.create || (() => Promise.resolve(null)));
  
  const createPayment = async (input: CreatePaymentInput): Promise<Payment | null> => {
    try {
      // Transform input to match API expectations  
      const payload = {
        applicationId: input.applicationId,
        amount: input.amount,
        serviceFee: input.serviceFee,
        netAmount: input.netAmount,
        paymentMethod: input.paymentMethod,
        referenceNumber: input.referenceNumber,
        ...(input.receiptId && { receiptStorageId: input.receiptId }),
      };
      const result = await createPaymentMutation(payload);
      return result as Payment;
    } catch (error) {
      console.error('Create payment error:', error);
      return null;
    }
  };

  return {
    createPayment,
    isLoading: false,
  };
};

export const useUpdatePaymentStatus = () => {
  const updatePaymentStatusMutation = useMutation(apiEndpoints.payments.updateStatus || (() => Promise.resolve(null)));
  
  const updatePaymentStatus = async (
    paymentId: ConvexId<'payments'>, 
    status: PaymentStatus
  ): Promise<Payment | null> => {
    try {
      const result = await updatePaymentStatusMutation({ 
        paymentId, 
        paymentStatus: status 
      });
      return result as Payment;
    } catch (error) {
      console.error('Update payment status error:', error);
      return null;
    }
  };

  return {
    updatePaymentStatus,
    isLoading: false,
  };
};
