import { MMKV } from 'react-native-mmkv';

// Create a fallback storage for development when MMKV fails
class FallbackStorage {
  private data = new Map<string, any>();
  
  set(key: string, value: any): void {
    this.data.set(key, value);
  }
  
  getString(key: string): string | undefined {
    return this.data.get(key);
  }
  
  getNumber(key: string): number | undefined {
    return this.data.get(key);
  }
  
  getBoolean(key: string): boolean | undefined {
    return this.data.get(key);
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

// Try to create MMKV instances, fall back to memory storage if it fails
let storage: MMKV | FallbackStorage;
let encryptedStorage: MMKV | FallbackStorage;

try {
  /**
   * Default MMKV storage instance
   * This is the main storage instance for the app
   */
  storage = new MMKV();
  
  /**
   * Encrypted storage instance for sensitive data
   * Uses a basic encryption key - in production, use a secure key from Keychain/Keystore
   */
  encryptedStorage = new MMKV({
    id: 'encrypted-storage',
    encryptionKey: 'your-encryption-key-here', // In production, get this from secure storage
  });
  console.log('✅ MMKV storage initialized successfully');
} catch (error) {
  console.warn('⚠️ MMKV failed to initialize, using fallback storage:', error);
  storage = new FallbackStorage();
  encryptedStorage = new FallbackStorage();
}

export { storage, encryptedStorage };

/**
 * User-specific storage instance
 * Can be used to separate data per user
 */
export const createUserStorage = (userId: string) => {
  try {
    return new MMKV({
      id: `user-${userId}-storage`,
    });
  } catch (error) {
    console.warn(`⚠️ Failed to create user storage for ${userId}, using fallback:`, error);
    return new FallbackStorage();
  }
};

// Storage helper interface
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
 * Set a string value in storage
 */
export const setItem = (key: string, value: string): void => {
  storage.set(key, value);
};

/**
 * Get a string value from storage
 */
export const getItem = (key: string): string | undefined => {
  return storage.getString(key);
};

/**
 * Set a number value in storage
 */
export const setNumber = (key: string, value: number): void => {
  storage.set(key, value);
};

/**
 * Get a number value from storage
 */
export const getNumber = (key: string): number | undefined => {
  return storage.getNumber(key);
};

/**
 * Set a boolean value in storage
 */
export const setBoolean = (key: string, value: boolean): void => {
  storage.set(key, value);
};

/**
 * Get a boolean value from storage
 */
export const getBoolean = (key: string): boolean | undefined => {
  return storage.getBoolean(key);
};

/**
 * Set an object value in storage (automatically serialized to JSON)
 */
export const setObject = <T>(key: string, value: T): void => {
  try {
    const jsonValue = JSON.stringify(value);
    storage.set(key, jsonValue);
  } catch (error) {
    console.error('Failed to serialize object for storage:', error);
    throw error;
  }
};

/**
 * Get an object value from storage (automatically parsed from JSON)
 */
export const getObject = <T>(key: string): T | null => {
  try {
    const jsonValue = storage.getString(key);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Failed to parse object from storage:', error);
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
 * Get the size of the storage in bytes
 * Note: MMKV v2 doesn't expose size property directly
 */
export const getStorageSize = (): number => {
  // MMKV v2 doesn't provide size info, return keys count as approximation
  return storage.getAllKeys().length;
};

/**
 * Clean unused keys and clear memory cache
 * Should be called when storage size gets large
 */
export const trimStorage = (): void => {
  const keyCount = storage.getAllKeys().length;
  if (keyCount >= 100) {
    // MMKV v2 doesn't have trim(), so we'll clear expired items instead
    cacheUtils.clearExpired();
    console.log(`✨ Storage maintenance completed. Key count: ${keyCount}`);
  }
};

/**
 * Encrypt the storage with a new key
 */
export const encryptStorage = (encryptionKey: string): void => {
  storage.recrypt(encryptionKey);
  console.log('🔐 Storage encrypted with new key');
};

/**
 * Remove encryption from storage
 */
export const removeEncryption = (): void => {
  storage.recrypt(undefined);
  console.log('🔓 Storage encryption removed');
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
 * Cache utilities for common caching patterns
 */
export const cacheUtils = {
  /**
   * Set a value with expiration time
   */
  setWithExpiry: (key: string, value: any, expiryInMs: number): void => {
    const expiryTime = Date.now() + expiryInMs;
    const cacheItem = {
      value,
      expiry: expiryTime,
    };
    setObject(key, cacheItem);
  },

  /**
   * Get a value if not expired, null if expired or doesn't exist
   */
  getWithExpiry: <T>(key: string): T | null => {
    const cacheItem = getObject<{ value: T; expiry: number }>(key);
    if (!cacheItem) return null;

    if (Date.now() > cacheItem.expiry) {
      removeItem(key);
      return null;
    }

    return cacheItem.value;
  },

  /**
   * Clear expired cache items
   */
  clearExpired: (): void => {
    const keys = getAllKeys();
    let removedCount = 0;
    
    keys.forEach(key => {
      const cacheItem = getObject<{ value: any; expiry: number }>(key);
      if (cacheItem && cacheItem.expiry && Date.now() > cacheItem.expiry) {
        removeItem(key);
        removedCount++;
      }
    });
    
    if (removedCount > 0) {
      console.log(`🧹 Cleared ${removedCount} expired cache items`);
    }
  },
};

// Default export
export default storageHelper;
