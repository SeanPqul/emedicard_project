import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/src/shared/navigation/types';

export interface ApplicationListScreenProps {
  navigation: NavigationProp<RootStackParamList, 'ApplicationList'>;
  route: RouteProp<RootStackParamList, 'ApplicationList'>;
}

export interface ApplicationWithDetails {
  _id: string;
  _creationTime: number;
  userId: string;
  formId: string;
  status: 'Pending Payment' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  approvedAt?: number;
  remarks?: string;
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
}

export type FilterStatus = 'All' | 'Pending Payment' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
export type SortOption = 'Date' | 'Status' | 'Category';

export interface ApplicationListScreenState {
  searchQuery: string;
  selectedFilter: FilterStatus;
  selectedSort: SortOption;
  refreshing: boolean;
  showFilters: boolean;
}

export const STATUS_COLORS = {
  'Pending Payment': '#FFA500',
  'Submitted': '#2E86AB',
  'Under Review': '#F18F01',
  'Approved': '#28A745',
  'Rejected': '#DC3545',
} as const;

export const FILTER_OPTIONS: FilterStatus[] = ['All', 'Pending Payment', 'Submitted', 'Under Review', 'Approved', 'Rejected'];
export const SORT_OPTIONS: SortOption[] = ['Date', 'Status', 'Category'];