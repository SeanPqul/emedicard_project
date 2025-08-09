// Convex ID types for type safety
export type Id<T extends string> = string & { readonly __tableName: T };

// User Related Types
export type UserRole = 'applicant' | 'inspector' | 'admin';
// Note: Admin functionality is handled via separate web interface

export interface User {
  _id: Id<"users">;
  _creationTime: number;
  username: string;
  fullname: string;
  email: string;
  image: string;
  gender?: string;
  birthDate?: string;
  phoneNumber?: string;
  role: UserRole;
  clerkId: string;
}

// Application Related Types
export interface Application {
  _id: Id<"forms">;
  userId: Id<"users">;
  applicationType: 'New' | 'Renew';
  jobCategory: Id<"jobCategory">;
  position: string;
  organization: string;
  civilStatus: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  createdAt?: number;
  updatedAt?: number;
}

export interface ApplicationForm {
  _id: Id<"forms">;
  userId: Id<"users">;
  formId: Id<"forms">;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  approvedAt: number;
  remarks?: string;
}

// Payment Related Types
export interface Payment {
  _id: Id<"payments">;
  formId: Id<"forms">;
  amount: number;
  serviceFee: number;
  netAmount: number;
  method: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall';
  referenceNumber: string;
  receiptId?: Id<"_storage">;
  status: 'Pending' | 'Complete' | 'Failed';
}

// Health Card Related Types
export interface HealthCard {
  _id: Id<"healthCards">;
  formId: Id<"forms">;
  cardUrl: string;
  issuedAt: number;
  expiresAt: number;
  verificationToken: string;
}

export interface HealthCardData {
  _id: Id<"healthCards">;
  form: {
    _id: Id<"forms">;
    applicationType: 'New' | 'Renew';
    position: string;
    organization: string;
    status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  } | null;
  cardUrl?: string;
  issuedAt?: number;
  expiresAt?: number;
  verificationToken?: string;
}

// Notification Related Types
export interface Notification {
  _id: Id<"notifications">;
  userId: Id<"users">;
  formsId?: Id<"forms">;
  type: 'MissingDoc' | 'PaymentReceived' | 'FormApproved' | 'OrientationScheduled' | 'CardIssue';
  message: string;
  read: boolean;
  createdAt?: number;
}

// Job Category Types
export interface JobCategory {
  _id: Id<"jobCategory">;
  name: string;
  colorCode: string;
  requireOrientation: boolean;
}

export interface DocumentRequirement {
  _id: Id<"documentRequirements">;
  jobCategoryId: Id<"jobCategory">;
  name: string;
  description: string;
  icon: string;
  required: boolean;
  fieldName: string;
}

// Dashboard Related Types
export interface DashboardStats {
  activeApplications: number;
  pendingPayments: number;
  upcomingOrientations: number;
  validHealthCards: number;
  pendingAmount: number;
  nextOrientationDate?: string;
}

export interface RecentActivity {
  id: string;
  type: 'application' | 'payment' | 'orientation' | 'card_issued';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning' | 'error';
}

// Component Props Types
export interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

export interface ActionButtonProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isPrimary?: boolean;
}

export interface ActivityItemProps {
  activity: RecentActivity;
}

export interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionText?: string;
  onActionPress?: () => void;
}

// Form Related Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'date' | 'file';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormData {
  [key: string]: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Navigation Types
export interface ScreenProps {
  navigation: any;
  route: any;
}

// Theme Types (re-export from theme file)
export type { Theme } from '../styles/theme';
