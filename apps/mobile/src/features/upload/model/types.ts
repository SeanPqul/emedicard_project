// Upload feature types

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export interface UploadOperation {
  id: string;
  documentId: string;
  file: UploadFile;
  status: UploadStatus;
  progress: number;
  error?: string;
  timestamp: number;
  uploadResult?: {
    storageId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  };
}

export interface UploadQueue {
  id: string;
  applicationId: string;
  operations: Record<string, UploadOperation>;
  status: 'draft' | 'submitting' | 'completed' | 'failed';
  timestamp: number;
  expiresAt: number;
}

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
