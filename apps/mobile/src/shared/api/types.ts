import { Id } from '../../../../../backend/convex/_generated/dataModel';

// ===== COMMON TYPES =====

export type ConvexId<T extends string> = Id<T>;

export type ApiResponse<T = any> = {
  data: T;
  success: boolean;
  message?: string;
};

export type ApiError = {
  message: string;
  code?: string;
  isRetryable?: boolean;
};

export type LoadingState = {
  isLoading: boolean;
  error: ApiError | null;
};

// ===== USER TYPES =====

export type UserRole = "applicant" | "inspector" | "admin";

export interface User {
  _id: ConvexId<"users">;
  clerkId: string;
  email: string;
  username: string;
  fullname: string;
  image: string;
  role: UserRole;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  metadata?: Record<string, any>;
  _creationTime: number;
}

export interface CreateUserInput {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  image: string;
  role?: UserRole;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  profileImage?: string;
  metadata?: Record<string, any>;
}

// ===== APPLICATION TYPES =====

export type ApplicationStatus = "Draft" | "Submitted" | "Under Review" | "Approved" | "Rejected" | "Completed";
export type ApplicationType = "New" | "Renew";
export type PaymentMethod = "Gcash" | "Maya" | "BaranggayHall" | "CityHall";

export interface Application {
  _id: ConvexId<"applications">;
  userId: ConvexId<"users">;
  applicationType: ApplicationType;
  jobCategoryId: ConvexId<"jobCategories">;
  position: string;
  organization: string;
  civilStatus: string;
  status: ApplicationStatus;
  paymentMethod?: PaymentMethod;
  paymentReferenceNumber?: string;
  paymentReceiptId?: ConvexId<"_storage">;
  _creationTime: number;
}

export interface CreateApplicationInput {
  applicationType: ApplicationType;
  jobCategoryId: ConvexId<"jobCategories">;
  position: string;
  organization: string;
  civilStatus: string;
}

export interface UpdateApplicationInput {
  applicationType?: ApplicationType;
  jobCategoryId?: ConvexId<"jobCategories">;
  position?: string;
  organization?: string;
  civilStatus?: string;
  status?: ApplicationStatus;
}

export interface SubmitApplicationInput {
  applicationId: ConvexId<"applications">;
  paymentMethod: PaymentMethod;
  paymentReferenceNumber: string;
  paymentReceiptId?: ConvexId<"_storage">;
}

// ===== HEALTH CARD TYPES =====

export interface HealthCard {
  _id: ConvexId<"healthCards">;
  applicationId: ConvexId<"applications">;
  userId: ConvexId<"users">;
  cardNumber: string;
  issueDate: string;
  expiryDate: string;
  status: "Active" | "Expired" | "Suspended";
  qrCodeData: string;
  _creationTime: number;
}

// ===== PAYMENT TYPES =====

export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Refunded";

export interface Payment {
  _id: ConvexId<"payments">;
  applicationId: ConvexId<"applications">;
  userId: ConvexId<"users">;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  receiptId?: ConvexId<"_storage">;
  status: PaymentStatus;
  _creationTime: number;
}

// ===== JOB CATEGORY TYPES =====

export interface JobCategory {
  _id: ConvexId<"jobCategories">;
  name: string;
  description?: string;
  requirements: string[];
  fee: number;
  _creationTime: number;
}

// ===== DOCUMENT TYPES =====

export type DocumentType = 
  | "GovernmentId"
  | "MedicalCertificate" 
  | "DrugTestResult"
  | "XrayResult"
  | "PaymentReceipt"
  | "Other";

export interface Document {
  _id: ConvexId<"documents">;
  applicationId: ConvexId<"applications">;
  userId: ConvexId<"users">;
  type: DocumentType;
  name: string;
  storageId: ConvexId<"_storage">;
  mimeType: string;
  size: number;
  _creationTime: number;
}

// ===== NOTIFICATION TYPES =====

export type NotificationType = "Info" | "Success" | "Warning" | "Error";
export type NotificationStatus = "Unread" | "Read";

export interface Notification {
  _id: ConvexId<"notifications">;
  userId: ConvexId<"users">;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  actionUrl?: string;
  _creationTime: number;
}

// ===== API HOOK RETURN TYPES =====

export interface QueryResult<T> extends LoadingState {
  data: T | undefined;
}

export interface MutationResult<TInput, TOutput> {
  mutate: (input: TInput) => Promise<TOutput | null>;
  isLoading: boolean;
}

export interface CrudHooks<TEntity, TCreateInput, TUpdateInput> {
  useGetAll: () => QueryResult<TEntity[]>;
  useGetById: (id?: ConvexId<any>) => QueryResult<TEntity>;
  useCreate: () => MutationResult<TCreateInput, TEntity>;
  useUpdate: () => MutationResult<{ id: ConvexId<any> } & TUpdateInput, TEntity>;
}

// ===== PAGINATION TYPES =====

export interface PaginationParams {
  limit: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

// ===== FILTER TYPES =====

export interface UserFilters {
  role?: UserRole;
  search?: string;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  applicationType?: ApplicationType;
  dateRange?: {
    start: string;
    end: string;
  };
}