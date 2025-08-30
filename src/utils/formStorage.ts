import { storageUtils, cacheStorage, StorageKeys } from '../lib/storage/mmkv';
import { SelectedDocuments } from '../types';
import { ApplicationFormData } from '../shared/validation/form-validation';

interface TempApplicationData {
  formData: ApplicationFormData;
  selectedDocuments: SelectedDocuments;
  currentStep: number;
  timestamp: number;
  queueId: string; // Unique queue identifier
}

interface DocumentFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
  mimeType?: string;
  fileName?: string;
}

interface UploadOperation {
  id: string;
  documentId: string;
  file: DocumentFile;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
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

interface DeferredOperationQueue {
  id: string;
  formData: ApplicationFormData;
  uploadOperations: Record<string, UploadOperation>;
  status: 'draft' | 'submitting' | 'completed' | 'failed';
  timestamp: number;
}

export const formStorage = {
  /**
   * Generate unique queue ID for deferred operations
   */
  generateQueueId: (): string => {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Create or update deferred operation queue
   */
  saveDeferredQueue: (
    formData: ApplicationFormData,
    selectedDocuments: SelectedDocuments,
    currentStep: number,
    queueId?: string
  ): string => {
    const id = queueId || formStorage.generateQueueId();
    const existingQueue = formStorage.getDeferredQueue(id);
    
    // Create upload operations for documents
    const uploadOperations: Record<string, UploadOperation> = {};
    Object.entries(selectedDocuments).forEach(([documentId, file]) => {
      const existingOp = existingQueue?.uploadOperations[documentId];
      uploadOperations[documentId] = {
        id: existingOp?.id || `op_${Date.now()}_${documentId}`,
        documentId,
        file: file as DocumentFile,
        status: existingOp?.status || 'pending',
        progress: existingOp?.progress || 0,
        error: existingOp?.error || undefined,
        timestamp: existingOp?.timestamp || Date.now(),
      };
    });

    const queue: DeferredOperationQueue = {
      id,
      formData,
      uploadOperations,
      status: existingQueue?.status || 'draft',
      timestamp: Date.now(),
    };

    // Save queue
    storageUtils.safeSet(`deferred_queue_${id}`, queue, cacheStorage);

    // Update temp application reference
    const tempData: TempApplicationData = {
      formData,
      selectedDocuments,
      currentStep,
      timestamp: Date.now(),
      queueId: id,
    };
    storageUtils.safeSet(StorageKeys.TEMP_FORM_DATA, tempData, cacheStorage);

    return id;
  },

  /**
   * Get deferred operation queue by ID
   */
  getDeferredQueue: (queueId: string): DeferredOperationQueue | null => {
    return storageUtils.safeGet<DeferredOperationQueue | null>(
      `deferred_queue_${queueId}`,
      null,
      cacheStorage
    );
  },

  /**
   * Update operation status in queue
   */
  updateOperationStatus: (
    queueId: string,
    operationId: string,
    status: UploadOperation['status'],
    progress?: number,
    error?: string,
    uploadResult?: {
      storageId: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    }
  ): boolean => {
    const queue = formStorage.getDeferredQueue(queueId);
    if (!queue) return false;

    const operation = Object.values(queue.uploadOperations).find(op => op.id === operationId);
    if (!operation) return false;

    operation.status = status;
    if (progress !== undefined) operation.progress = progress;
    if (error !== undefined) operation.error = error;
    if (uploadResult !== undefined) operation.uploadResult = uploadResult;
    operation.timestamp = Date.now();

    return storageUtils.safeSet(`deferred_queue_${queueId}`, queue, cacheStorage);
  },

  /**
   * Update queue status
   */
  updateQueueStatus: (queueId: string, status: DeferredOperationQueue['status']): boolean => {
    const queue = formStorage.getDeferredQueue(queueId);
    if (!queue) return false;

    queue.status = status;
    queue.timestamp = Date.now();

    return storageUtils.safeSet(`deferred_queue_${queueId}`, queue, cacheStorage);
  },

  /**
   * Get current application data (backwards compatibility)
   */
  getTempApplication: (): TempApplicationData | null => {
    return storageUtils.safeGet<TempApplicationData | null>(
      StorageKeys.TEMP_FORM_DATA,
      null,
      cacheStorage
    );
  },

  /**
   * Add document to queue (deferred - not uploaded immediately)
   */
  addDocumentToQueue: (documentId: string, file: DocumentFile): boolean => {
    const tempApp = formStorage.getTempApplication();
    if (!tempApp) return false;

    // Update selected documents
    const updatedDocuments = { ...tempApp.selectedDocuments, [documentId]: file };
    
    // Save updated queue
    formStorage.saveDeferredQueue(
      tempApp.formData,
      updatedDocuments,
      tempApp.currentStep,
      tempApp.queueId
    );

    return true;
  },

  /**
   * Remove document from queue
   */
  removeDocumentFromQueue: (documentId: string): boolean => {
    const tempApp = formStorage.getTempApplication();
    if (!tempApp) return false;

    // Update selected documents
    const updatedDocuments = { ...tempApp.selectedDocuments };
    delete updatedDocuments[documentId];
    
    // Save updated queue
    formStorage.saveDeferredQueue(
      tempApp.formData,
      updatedDocuments,
      tempApp.currentStep,
      tempApp.queueId
    );

    return true;
  },

  /**
   * Get upload operations for current queue
   */
  getUploadOperations: (): Record<string, UploadOperation> => {
    const tempApp = formStorage.getTempApplication();
    if (!tempApp?.queueId) return {};

    const queue = formStorage.getDeferredQueue(tempApp.queueId);
    return queue?.uploadOperations || {};
  },

  /**
   * Clear all temporary data and queues
   */
  clearTempApplication: (): void => {
    const tempApp = formStorage.getTempApplication();
    
    // Clear temp application
    storageUtils.removeKey(StorageKeys.TEMP_FORM_DATA, cacheStorage);
    storageUtils.removeKey(StorageKeys.TEMP_UPLOAD_QUEUE, cacheStorage);
    
    // Clear deferred queue if exists
    if (tempApp?.queueId) {
      storageUtils.removeKey(`deferred_queue_${tempApp.queueId}`, cacheStorage);
    }
  },

  /**
   * Get queue statistics
   */
  getQueueStats: (): { 
    totalOperations: number;
    pendingOperations: number;
    completedOperations: number;
    failedOperations: number;
    queueStatus: string;
  } => {
    const operations = formStorage.getUploadOperations();
    const tempApp = formStorage.getTempApplication();
    const queue = tempApp?.queueId ? formStorage.getDeferredQueue(tempApp.queueId) : null;

    const totalOperations = Object.keys(operations).length;
    const pendingOperations = Object.values(operations).filter(op => op.status === 'pending').length;
    const completedOperations = Object.values(operations).filter(op => op.status === 'completed').length;
    const failedOperations = Object.values(operations).filter(op => op.status === 'failed').length;

    return {
      totalOperations,
      pendingOperations,
      completedOperations,
      failedOperations,
      queueStatus: queue?.status || 'draft',
    };
  },

  /**
   * Check if application has expired
   */
  isTempApplicationExpired: (): boolean => {
    const tempApp = formStorage.getTempApplication();
    if (!tempApp) return false;
    
    const age = Math.floor((Date.now() - tempApp.timestamp) / (1000 * 60));
    return age > 30; // 30 minutes expiry
  },

  /**
   * Clean expired data
   */
  cleanExpiredTempData: (): boolean => {
    if (formStorage.isTempApplicationExpired()) {
      formStorage.clearTempApplication();
      return true;
    }
    return false;
  },

  /**
   * Check if app was restarted and clear old data
   */
  handleAppRestart: (): boolean => {
    const lastAppSession = storageUtils.safeGet<number>('last_app_session', 0, cacheStorage);
    const currentTime = Date.now();
    
    // If more than 5 minutes passed since last session, consider it a restart
    const sessionGap = currentTime - lastAppSession;
    const wasRestarted = sessionGap > (5 * 60 * 1000); // 5 minutes
    
    // Update session timestamp
    storageUtils.safeSet('last_app_session', currentTime, cacheStorage);
    
    // Clear temp data if app was restarted
    if (wasRestarted) {
      const tempApp = formStorage.getTempApplication();
      if (tempApp) {
        console.log('App restart detected, clearing old application data');
        formStorage.clearTempApplication();
        return true;
      }
    }
    
    return false;
  },

  /**
   * Force clear all application data (for cancel functionality)
   */
  cancelApplication: (): void => {
    console.log('Application cancelled by user');
    formStorage.clearTempApplication();
    
    // Clear session to prevent restore
    storageUtils.removeKey('last_app_session', cacheStorage);
  },

  /**
   * Backwards compatibility methods
   */
  saveTempApplication: (
    formData: ApplicationFormData,
    selectedDocuments: SelectedDocuments,
    currentStep: number
  ): boolean => {
    try {
      formStorage.saveDeferredQueue(formData, selectedDocuments, currentStep);
      return true;
    } catch {
      return false;
    }
  },

  hasTempApplication: (): boolean => {
    return formStorage.getTempApplication() !== null;
  },

  getTempApplicationAge: (): number => {
    const tempApp = formStorage.getTempApplication();
    if (!tempApp) return 0;
    
    return Math.floor((Date.now() - tempApp.timestamp) / (1000 * 60));
  },

  getUploadQueue: (): Record<string, DocumentFile> => {
    const operations = formStorage.getUploadOperations();
    const queue: Record<string, DocumentFile> = {};
    
    Object.values(operations).forEach(op => {
      queue[op.documentId] = op.file;
    });
    
    return queue;
  },

  saveDocumentToQueue: (documentId: string, file: DocumentFile): boolean => {
    return formStorage.addDocumentToQueue(documentId, file);
  },

  getTempDataStats: () => {
    const tempApp = formStorage.getTempApplication();
    const stats = formStorage.getQueueStats();
    
    return {
      hasApplication: tempApp !== null,
      applicationAge: tempApp ? formStorage.getTempApplicationAge() : 0,
      documentsCount: stats.totalOperations,
      isExpired: formStorage.isTempApplicationExpired(),
      step: tempApp?.currentStep || 0,
      queueStatus: stats.queueStatus,
    };
  },
  
  /**
   * Check if queue is ready for submission
   */
  isQueueReadyForSubmission: (): { ready: boolean; reason?: string } => {
    const tempApp = formStorage.getTempApplication();
    if (!tempApp?.queueId) {
      return { ready: false, reason: 'No application data found' };
    }
    
    const queue = formStorage.getDeferredQueue(tempApp.queueId);
    if (!queue) {
      return { ready: false, reason: 'Upload queue not found' };
    }
    
    if (queue.status === 'submitting') {
      return { ready: false, reason: 'Application is already being submitted' };
    }
    
    if (queue.status === 'completed') {
      return { ready: false, reason: 'Application has already been submitted' };
    }
    
    const operations = Object.values(queue.uploadOperations);
    const failedOperations = operations.filter(op => op.status === 'failed');
    
    if (failedOperations.length > 0) {
      return { 
        ready: false, 
        reason: `${failedOperations.length} document(s) failed to upload and need to be retried` 
      };
    }
    
    return { ready: true };
  },
  
  /**
   * Retry failed operations in the queue
   */
  retryFailedOperations: (): number => {
    const tempApp = formStorage.getTempApplication();
    if (!tempApp?.queueId) return 0;
    
    const queue = formStorage.getDeferredQueue(tempApp.queueId);
    if (!queue) return 0;
    
    let retriedCount = 0;
    Object.values(queue.uploadOperations).forEach(operation => {
      if (operation.status === 'failed') {
        formStorage.updateOperationStatus(
          tempApp.queueId, 
          operation.id, 
          'pending', 
          0
        );
        retriedCount++;
      }
    });
    
    return retriedCount;
  },
  
  /**
   * Get detailed queue health status
   */
  getQueueHealthStatus: () => {
    const tempApp = formStorage.getTempApplication();
    const stats = formStorage.getQueueStats();
    const readiness = formStorage.isQueueReadyForSubmission();
    
    return {
      ...stats,
      isReady: readiness.ready,
      readinessReason: readiness.reason,
      hasApplication: tempApp !== null,
      queueId: tempApp?.queueId,
      applicationAge: tempApp ? formStorage.getTempApplicationAge() : 0,
      isExpired: formStorage.isTempApplicationExpired(),
    };
  },
};