// Upload feature types - Re-exports from entity (FSD pattern)
import type {
  UploadStatus,
  UploadFile,
  UploadOperation,
  UploadQueue
} from '@entities/upload';

// Re-export entity types
export type {
  UploadStatus,
  UploadFile,
  UploadOperation,
  UploadQueue
};

// Feature-specific types (UI/configuration related)
export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  fieldName: string;
  required: boolean;
  formats: string[];
  maxSize: number; // bytes
  category?: string;
}

export interface UploadConfig {
  maxFileSize: number; // bytes
  allowedFormats: string[];
  maxRetries: number;
  retryDelay: number; // ms
  chunkSize?: number; // for chunked uploads
  enableCompression?: boolean;
}
