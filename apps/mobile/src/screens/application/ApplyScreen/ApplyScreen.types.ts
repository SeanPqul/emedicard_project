import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/shared/types/navigation';
import { JobCategory, DocumentRequirement } from '@entities/application/model/types';
import { User } from '@entities/user/model/types';

export interface ApplyScreenProps {
  navigation: NavigationProp<RootStackParamList, 'Apply'>;
  route: RouteProp<RootStackParamList, 'Apply'>;
}

export interface FormData {
  applicationType: 'New' | 'Renew' | '';
  jobCategory: string;
  // Personal details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  organization: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  dateOfBirth: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  // Job details
  jobSalary?: string;
  employmentStatus?: string;
  workLocation?: string;
  startDate?: string;
}

export interface SelectedDocument {
  requirementId: string;
  uri: string;
  name: string;
  type?: string;
  size?: number;
}

export interface UploadState {
  uploading: boolean;
  progress: number;
}

export interface FormErrors {
  applicationType?: string;
  jobCategory?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  organization?: string;
  address?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  dateOfBirth?: string;
  gender?: string;
  civilStatus?: string;
  nationality?: string;
  documents?: string;
}

export interface ApplyScreenState {
  currentStep: number;
  formData: FormData;
  errors: FormErrors;
  selectedDocuments: SelectedDocument[];
  uploadStates: Record<string, UploadState>;
  jobCategoriesData: JobCategory[];
  userProfile: User | null;
  requirementsByJobCategory: DocumentRequirement[];
  loadingData: boolean;
  showImagePicker: boolean;
  submitting: boolean;
}
