/**
 * Storage Service
 * 
 * Centralized service for local storage operations including MMKV,
 * AsyncStorage, and SecureStore with consistent API
 */

import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export type StorageType = 'mmkv' | 'async' | 'secure';

export interface StorageOptions {
  type?: StorageType;
  encryptionKey?: string;
  expiresIn?: number; // milliseconds
}

export interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

export class StorageService {
  private static instance: StorageService;
  private mmkv: MMKV;

  private constructor() {
    this.mmkv = new MMKV();
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Set a value in storage
   */
  async set<T>(
    key: string, 
    value: T, 
    options: StorageOptions = {}
  ): Promise<boolean> {
    try {
      const item: StorageItem<T> = {
        data: value,
        timestamp: Date.now(),
        expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined
      };

      const serializedValue = JSON.stringify(item);

      switch (options.type || 'mmkv') {
        case 'mmkv':
          this.mmkv.set(key, serializedValue);
          return true;

        case 'async':
          await AsyncStorage.setItem(key, serializedValue);
          return true;

        case 'secure':
          await SecureStore.setItemAsync(key, serializedValue);
          return true;

        default:
          throw new Error('Invalid storage type');
      }
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Get a value from storage
   */
  async get<T>(
    key: string, 
    options: StorageOptions = {}
  ): Promise<T | null> {
    try {
      let serializedValue: string | null = null;

      switch (options.type || 'mmkv') {
        case 'mmkv':
          serializedValue = this.mmkv.getString(key) || null;
          break;

        case 'async':
          serializedValue = await AsyncStorage.getItem(key);
          break;

        case 'secure':
          serializedValue = await SecureStore.getItemAsync(key);
          break;

        default:
          throw new Error('Invalid storage type');
      }

      if (!serializedValue) {
        return null;
      }

      const item: StorageItem<T> = JSON.parse(serializedValue);

      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        await this.remove(key, options);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Remove a value from storage
   */
  async remove(key: string, options: StorageOptions = {}): Promise<boolean> {
    try {
      switch (options.type || 'mmkv') {
        case 'mmkv':
          this.mmkv.delete(key);
          return true;

        case 'async':
          await AsyncStorage.removeItem(key);
          return true;

        case 'secure':
          await SecureStore.deleteItemAsync(key);
          return true;

        default:
          throw new Error('Invalid storage type');
      }
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Check if a key exists in storage
   */
  async exists(key: string, options: StorageOptions = {}): Promise<boolean> {
    try {
      const value = await this.get(key, options);
      return value !== null;
    } catch (error) {
      console.error(`Storage exists error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all data from storage
   */
  async clear(options: StorageOptions = {}): Promise<boolean> {
    try {
      switch (options.type || 'mmkv') {
        case 'mmkv':
          this.mmkv.clearAll();
          return true;

        case 'async':
          await AsyncStorage.clear();
          return true;

        case 'secure':
          // SecureStore doesn't have a clear all method
          // This would need to be implemented by tracking keys
          console.warn('SecureStore clear all not implemented');
          return false;

        default:
          throw new Error('Invalid storage type');
      }
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Get all keys from storage
   */
  async getAllKeys(options: StorageOptions = {}): Promise<string[]> {
    try {
      switch (options.type || 'mmkv') {
        case 'mmkv':
          return this.mmkv.getAllKeys();

        case 'async':
          return (await AsyncStorage.getAllKeys()) as string[];

        case 'secure':
          // SecureStore doesn't have a get all keys method
          console.warn('SecureStore getAllKeys not available');
          return [];

        default:
          throw new Error('Invalid storage type');
      }
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  }

  /**
   * Get storage size/stats
   */
  getStats(): { keys: number; size?: number } {
    try {
      const keys = this.mmkv.getAllKeys();
      return {
        keys: keys.length,
        size: undefined // MMKV doesn't provide size info easily
      };
    } catch (error) {
      console.error('Storage stats error:', error);
      return { keys: 0 };
    }
  }

  /**
   * Set with automatic expiration cleanup
   */
  async setWithExpiry<T>(
    key: string,
    value: T,
    expiresInMs: number,
    options: StorageOptions = {}
  ): Promise<boolean> {
    return this.set(key, value, {
      ...options,
      expiresIn: expiresInMs
    });
  }

  /**
   * Batch operations
   */
  async multiSet(
    keyValuePairs: Array<[string, any]>,
    options: StorageOptions = {}
  ): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const [key, value] of keyValuePairs) {
      const success = await this.set(key, value, options);
      results.push(success);
    }
    
    return results;
  }

  async multiGet<T>(
    keys: string[],
    options: StorageOptions = {}
  ): Promise<Array<T | null>> {
    const results: Array<T | null> = [];
    
    for (const key of keys) {
      const value = await this.get<T>(key, options);
      results.push(value);
    }
    
    return results;
  }

  /**
   * Clean up expired items
   */
  async cleanupExpired(options: StorageOptions = {}): Promise<number> {
    try {
      const keys = await this.getAllKeys(options);
      let cleanedCount = 0;

      for (const key of keys) {
        const value = await this.get(key, options);
        if (value === null) {
          // Item was expired and automatically removed
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Storage cleanup error:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();
export default storageService;
