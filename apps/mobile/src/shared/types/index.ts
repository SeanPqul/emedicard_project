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

// Document requirement types
export interface DocumentRequirement {
  fieldName: string;
  displayName: string;
  description?: string;
  required: boolean;
  fileTypes?: string[];
  maxSize?: number;
  category?: string;
}

// Recent activity types
export interface RecentActivity {
  id: string;
  type: 'application' | 'payment' | 'notification' | 'verification';
  title: string;
  description: string;
  timestamp: Date;
  icon?: string;
  color?: string;
  metadata?: Record<string, any>;
}
