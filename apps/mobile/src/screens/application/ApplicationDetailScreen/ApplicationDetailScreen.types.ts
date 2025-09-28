import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/src/shared/navigation/types';
import { Id } from '@backend/convex/_generated/dataModel';

export interface ApplicationDetailScreenProps {
  navigation: NavigationProp<RootStackParamList, 'ApplicationDetail'>;
  route: RouteProp<RootStackParamList, 'ApplicationDetail'>;
}

export type PaymentMethod = 'Maya' | 'Gcash' | 'BaranggayHall' | 'CityHall';

export interface ApplicationDetails {
  _id: string;
  _creationTime: number;
  userId: string;
  formId: string;
  status: 'Pending Payment' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  approvedAt?: number;
  remarks?: string;
  paymentDeadline?: number;
  form?: {
    _id: string;
    applicationType: 'New' | 'Renew';
    position: string;
    organization: string;
    civilStatus: string;
    jobCategory: string;
  };
  jobCategory?: {
    _id: string;
    name: string;
    colorCode: string;
    requireOrientation: string;
  };
  payment?: {
    _id: string;
    amount: number;
    method: string;
    status: string;
    referenceNumber?: string;
  };
}

export interface ApplicationDetailScreenState {
  refreshing: boolean;
  selectedPaymentMethod: PaymentMethod | null;
  paymentReference: string;
}

export const STATUS_COLORS = {
  'Pending Payment': '#FFA500',
  'Submitted': '#2E86AB',
  'Under Review': '#F18F01',
  'Approved': '#28A745',
  'Rejected': '#DC3545',
} as const;