// Shared types exports
// Note: Generic utility, navigation, and design-system types have been moved to src/types/
// Import from @types/* instead

// Document types
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

// Provider types
export interface ClerkAndConvexProviderProps {
  children: React.ReactNode;
}

export interface EnvironmentConfig {
  publishableKey: string;
  convexUrl: string;
}
