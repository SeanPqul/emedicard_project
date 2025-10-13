// Core navigation types
import { NavigationProp as RNNavigationProp, RouteProp as RNRouteProp } from '@react-navigation/native';

// Define all possible routes in the app
export type RootStackParamList = {
  // Auth routes
  '(auth)/sign-in': undefined;
  '(auth)/sign-up': undefined;
  '(auth)/verification': { email?: string };
  '(auth)/reset-password': { email?: string };
  
  // Tab routes
  '(tabs)': undefined;
  '(tabs)/index': undefined;
  '(tabs)/apply': undefined;
  '(tabs)/application': undefined;
  '(tabs)/profile': undefined;
  '(tabs)/notification': undefined;
  
  // Application routes
  '(screens)/(application)/[id]': { id: string };
  
  // Payment routes
  '(screens)/(payment)/success': { applicationId: string };
  '(screens)/(payment)/failed': { applicationId: string; reason?: string };
  '(screens)/(payment)/cancelled': { applicationId: string };
  
  // Shared routes
  '(screens)/(shared)/health-cards': undefined;
  '(screens)/(shared)/qr-code': { healthCardId: string };
  
  // Inspector routes
  '(screens)/(inspector)/inspector-dashboard': undefined;
  '(screens)/(inspector)/inspection-queue': undefined;
  '(screens)/(inspector)/review-applications': undefined;
  '(screens)/(inspector)/scanner': undefined;
};

// Navigation prop type helper
export type NavigationProp<T extends keyof RootStackParamList> = RNNavigationProp<RootStackParamList, T>;

// Route prop type helper
export type RouteProp<T extends keyof RootStackParamList> = RNRouteProp<RootStackParamList, T>;

// Screen props helper
export interface ScreenProps<T extends keyof RootStackParamList> {
  navigation: NavigationProp<T>;
  route: RouteProp<T>;
}

// Common navigation helpers
export interface NavigationHelpers {
  goBack: () => void;
  navigate: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T]
  ) => void;
  replace: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T]
  ) => void;
  reset: (routes: { name: keyof RootStackParamList; params?: any }[]) => void;
}
