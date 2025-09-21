import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/shared/types/navigation';

export interface SignInFormData {
  identifier: string;
  password: string;
}

export interface SignInScreenProps {
  navigation: NavigationProp<RootStackParamList, 'SignIn'>;
  route: RouteProp<RootStackParamList, 'SignIn'>;
}

export interface SignInScreenState {
  isLoading: boolean;
  showPassword: boolean;
  error: string | null;
  rememberMe: boolean;
}

export interface ValidationErrors {
  identifier?: string;
  password?: string;
}

export interface SignInResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  token?: string;
  refreshToken?: string;
}
