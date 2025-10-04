// Upload entity types - Core domain models for file uploads

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
  size: number;
  // Optional properties for compatibility with DocumentFile
  mimeType?: string;
  fileName?: string;
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
