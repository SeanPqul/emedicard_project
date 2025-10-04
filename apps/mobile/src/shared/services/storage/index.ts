// Storage Services
export * from './storage';

// Default exports
export { default as storageHelper } from './storage';

// formStorage has been moved to @features/application/services/formStorage

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

// Document cache has been moved to @features/upload/services/documentCache
