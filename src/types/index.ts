// Export utility types
export * from './utility-types';

// Export component types
export * from './components';

// Export domain types
export * from './domain';

// Export API types
export * from './api';

// Export design system types
export * from './design-system';

// Note: Legacy compatibility exports removed - import directly from domain modules

// Convex ID types for type safety
export type Id<T extends string> = string & { readonly __tableName: T };

// Navigation Types - Enhanced with proper typing
export interface NavigationProp {
  navigate: <RouteName extends string>(screen: RouteName, params?: Record<string, unknown>) => void;
  goBack: () => void;
  push: <RouteName extends string>(screen: RouteName, params?: Record<string, unknown>) => void;
  replace: <RouteName extends string>(screen: RouteName, params?: Record<string, unknown>) => void;
  reset: (state: any) => void;
  canGoBack: () => boolean;
}

export interface RouteProp<T = Record<string, unknown>> {
  params?: T;
  name: string;
  key: string;
}

export interface ScreenProps<TParams = Record<string, unknown>> {
  navigation: NavigationProp;
  route: RouteProp<TParams>;
}

// Theme Types (re-export from theme file)
export type { Theme } from '../styles/theme';

// Provider Types
export interface ClerkAndConvexProviderProps {
  children: React.ReactNode;
}

export interface EnvironmentConfig {
  publishableKey: string;
  convexUrl: string;
}

// Document File Types
export interface DocumentFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
  mimeType?: string;
  fileName?: string;
}

export interface SelectedDocuments {
  [fieldName: string]: DocumentFile;
}