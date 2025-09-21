import { MMKV } from 'react-native-mmkv';

// Fallback storage for debugging scenarios
class FallbackStorage {
  private data = new Map<string, any>();
  
  set(key: string, value: any): void {
    this.data.set(key, JSON.stringify(value));
  }
  
  getString(key: string): string | undefined {
    const value = this.data.get(key);
    try {
      return value ? JSON.parse(value) : undefined;
    } catch {
      return value;
    }
  }
  
  getNumber(key: string): number | undefined {
    const value = this.data.get(key);
    try {
      const parsed = value ? JSON.parse(value) : undefined;
      return typeof parsed === 'number' ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  
  getBoolean(key: string): boolean | undefined {
    const value = this.data.get(key);
    try {
      const parsed = value ? JSON.parse(value) : undefined;
      return typeof parsed === 'boolean' ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  
  delete(key: string): void {
    this.data.delete(key);
  }
  
  clearAll(): void {
    this.data.clear();
  }
  
  getAllKeys(): string[] {
    return Array.from(this.data.keys());
  }
  
  contains(key: string): boolean {
    return this.data.has(key);
  }
  
  recrypt(_key?: string): void {
    // No-op for fallback
  }
}

// Create storage instances with proper error handling
let storage: MMKV | FallbackStorage;
let encryptedStorage: MMKV | FallbackStorage;

try {
  // Try to create MMKV instances
  storage = new MMKV({
    id: 'emedicard-storage',
    encryptionKey: 'emedicard-secure-key-2024'
  });
  
  encryptedStorage = new MMKV({
    id: 'emedicard-encrypted-storage',
    encryptionKey: 'emedicard-secure-key-2024'
  });
  
  console.log('✅ MMKV initialized successfully');
} catch (error) {
  console.warn('⚠️ MMKV failed to initialize (likely due to remote debugging), using fallback storage:', error);
  storage = new FallbackStorage();
  encryptedStorage = new FallbackStorage();
}

export { storage, encryptedStorage };

// Storage monitoring and cleanup (2024 best practice)
const STORAGE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB limit

// Forward declaration - will be implemented later in the file
let cacheUtils: any;

const monitorStorageSize = () => {
  // MMKV v2 doesn't have size property, so we'll use key count as approximation
  const keyCount = storage.getAllKeys().length;
  const approximateMaxKeys = 1000; // Reasonable limit for key count
  
  if (keyCount >= approximateMaxKeys) {
    console.warn(`Storage has ${keyCount} keys, approaching limit. Running cleanup...`);
    // Instead of trim(), we'll trigger our custom cleanup if available
    if (cacheUtils?.clearExpired) {
      cacheUtils.clearExpired();
    }
  }
};

/**
 * User-specific storage instance with fallback support
 * Can be used to separate data per user
 */
export const createUserStorage = (userId: string): MMKV | FallbackStorage => {
  try {
    return new MMKV({
      id: `user-${userId}-storage`,
      encryptionKey: `user-${userId}-key-2024`
    });
  } catch (error) {
    console.warn(`⚠️ Failed to create user MMKV storage for ${userId}, using fallback:`, error);
    return new FallbackStorage();
  }
};

// Storage helper interface with proper TypeScript typing
interface StorageHelper {
  setItem: (key: string, value: string) => void;
  getItem: (key: string) => string | undefined;
  setNumber: (key: string, value: number) => void;
  getNumber: (key: string) => number | undefined;
  setBoolean: (key: string, value: boolean) => void;
  getBoolean: (key: string) => boolean | undefined;
  setObject: <T>(key: string, value: T) => void;
  getObject: <T>(key: string) => T | null;
  removeItem: (key: string) => void;
  clearAll: () => void;
  getAllKeys: () => string[];
  hasKey: (key: string) => boolean;
  getStorageSize: () => number;
  trimStorage: () => void;
}

/**
 * Set a string value in storage with automatic size monitoring
 */
export const setItem = (key: string, value: string): void => {
  storage.set(key, value);
  monitorStorageSize();
};

/**
 * Get a string value from storage with null safety
 */
export const getItem = (key: string): string | undefined => {
  const value = storage.getString(key);
  return value ?? undefined;
};

/**
 * Set a number value in storage
 */
export const setNumber = (key: string, value: number): void => {
  storage.set(key, value);
  monitorStorageSize();
};

/**
 * Get a number value from storage with proper undefined handling
 */
export const getNumber = (key: string): number | undefined => {
  const value = storage.getNumber(key);
  return value ?? undefined;
};

/**
 * Set a boolean value in storage
 */
export const setBoolean = (key: string, value: boolean): void => {
  storage.set(key, value);
  monitorStorageSize();
};

/**
 * Get a boolean value from storage with proper undefined handling
 */
export const getBoolean = (key: string): boolean | undefined => {
  const value = storage.getBoolean(key);
  return value ?? undefined;
};

/**
 * Set an object value in storage (automatically serialized to JSON)
 * Enhanced with better error handling and type safety
 */
export const setObject = <T>(key: string, value: T): void => {
  try {
    const jsonValue = JSON.stringify(value);
    storage.set(key, jsonValue);
    monitorStorageSize();
  } catch (error) {
    console.error(`Failed to serialize object for key "${key}":`, error);
    throw new Error(`Storage serialization failed for key: ${key}`);
  }
};

/**
 * Get an object value from storage (automatically parsed from JSON)
 * Enhanced with better error handling and null safety
 */
export const getObject = <T>(key: string): T | null => {
  try {
    const jsonValue = storage.getString(key);
    if (!jsonValue) return null;
    
    return JSON.parse(jsonValue) as T;
  } catch (error) {
    console.error(`Failed to parse object from key "${key}":`, error);
    // Clean up corrupted data
    storage.delete(key);
    return null;
  }
};

/**
 * Remove an item from storage
 */
export const removeItem = (key: string): void => {
  storage.delete(key);
};

/**
 * Clear all items from storage
 */
export const clearAll = (): void => {
  storage.clearAll();
};

/**
 * Get all keys in storage
 */
export const getAllKeys = (): string[] => {
  return storage.getAllKeys();
};

/**
 * Check if a key exists in storage
 */
export const hasKey = (key: string): boolean => {
  return storage.contains(key);
};

/**
 * Get approximation of storage usage (MMKV v2 compatible)
 */
export const getStorageSize = (): number => {
  // MMKV v2 doesn't provide size info, return keys count as approximation
  return storage.getAllKeys().length;
};

/**
 * Clean expired cache items (MMKV v2 compatible alternative to trim)
 */
export const trimStorage = (): void => {
  const removedCount = cacheUtils.clearExpired();
  console.log(`Storage cleanup completed: removed ${removedCount} expired items`);
};

/**
 * Encrypt the storage with a new key
 */
export const encryptStorage = (encryptionKey: string): void => {
  storage.recrypt(encryptionKey);
};

/**
 * Remove encryption from storage
 */
export const removeEncryption = (): void => {
  storage.recrypt(undefined);
};

/**
 * Storage helper object with all methods
 */
export const storageHelper: StorageHelper = {
  setItem,
  getItem,
  setNumber,
  getNumber,
  setBoolean,
  getBoolean,
  setObject,
  getObject,
  removeItem,
  clearAll,
  getAllKeys,
  hasKey,
  getStorageSize,
  trimStorage,
};

/**
 * Enhanced cache utilities with expiration and cleanup
 */
export const cacheUtilsImpl = {
  /**
   * Set a value with expiration time
   */
  setWithExpiry: <T>(key: string, value: T, expiryInMs: number): void => {
    const expiryTime = Date.now() + expiryInMs;
    const cacheItem = {
      value,
      expiry: expiryTime,
      createdAt: Date.now()
    };
    setObject(`cache_${key}`, cacheItem);
  },

  /**
   * Get a value if not expired, null if expired or doesn't exist
   */
  getWithExpiry: <T>(key: string): T | null => {
    const cacheItem = getObject<{ value: T; expiry: number; createdAt: number }>(`cache_${key}`);
    if (!cacheItem) return null;

    if (Date.now() > cacheItem.expiry) {
      removeItem(`cache_${key}`);
      return null;
    }

    return cacheItem.value;
  },

  /**
   * Clear expired cache items with performance optimization
   */
  clearExpired: (): number => {
    const keys = getAllKeys().filter(key => key.startsWith('cache_'));
    let removedCount = 0;
    
    keys.forEach(key => {
      const cacheItem = getObject<{ value: any; expiry: number }>(key);
      if (cacheItem?.expiry && Date.now() > cacheItem.expiry) {
        removeItem(key);
        removedCount++;
      }
    });
    
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} expired cache items`);
    }
    
    return removedCount;
  },

  /**
   * Clear all cache items
   */
  clearAllCache: (): number => {
    const keys = getAllKeys().filter(key => key.startsWith('cache_'));
    keys.forEach(key => removeItem(key));
    console.log(`Cleared ${keys.length} cache items`);
    return keys.length;
  }
};

// Assign the implementation to the forward declaration
cacheUtils = cacheUtilsImpl;
export { cacheUtilsImpl as cacheUtils };

// Periodic cleanup task
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start automatic cache cleanup (runs every 5 minutes)
 */
export const startAutomaticCleanup = (): void => {
  if (cleanupInterval) return; // Already started
  
  cleanupInterval = setInterval(() => {
    try {
      cacheUtils.clearExpired();
      
      // Clean storage if it gets too many keys (MMKV v2 compatible)
      const keyCount = getStorageSize();
      if (keyCount > 800) { // Trigger at 80% of 1000 keys limit
        trimStorage();
      }
    } catch (error) {
      console.error('Error during automatic storage cleanup:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
};

/**
 * Stop automatic cleanup
 */
export const stopAutomaticCleanup = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};

// Default export
export default storageHelper;