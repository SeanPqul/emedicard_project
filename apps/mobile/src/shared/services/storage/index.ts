// Storage Services
export * from './storage';
export * from './documentCache';
export * from './formStorage';

// Default exports
export { default as storageHelper } from './storage';
export { formStorage } from './formStorage';

// Re-export commonly used functions for convenience
export { 
  storage, 
  encryptedStorage, 
  setItem, 
  getItem, 
  setObject, 
  getObject,
  removeItem,
  clearAll,
  getAllKeys,
  hasKey,
  cacheUtils,
  startAutomaticCleanup,
  stopAutomaticCleanup
} from './storage';

export {
  cacheDocument,
  getCachedDocument,
  getCachedDocumentsByForm,
  updateCachedDocumentStatus,
  removeCachedDocument,
  clearFormCache,
  getAllCachedDocuments,
  getFailedDocuments,
  cleanupOldCache,
  getCacheStats,
  smartCacheCleanup,
  checkMemoryLimits,
  addToUploadQueue,
  getNextUploadBatch,
  removeFromUploadQueue,
  clearUploadQueue,
  getUploadQueueStats
} from './documentCache';
