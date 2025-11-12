/**
 * useHealthTip Hook
 *
 * Custom hook for fetching and caching daily health tips
 * - Fetches from Quotable API
 * - Caches for 24 hours
 * - Provides manual refresh
 * - Handles offline scenarios
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchHealthTip,
  getFallbackHealthTips,
  HealthTip,
} from '@shared/services/healthTipsService';

const STORAGE_KEY = '@emedicard:health_tip';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedHealthTip {
  tip: HealthTip;
  timestamp: number;
}

interface UseHealthTipReturn {
  healthTip: HealthTip | null;
  isLoading: boolean;
  error: string | null;
  refreshTip: () => Promise<void>;
}

/**
 * Custom hook to manage health tips with caching
 *
 * @returns {UseHealthTipReturn} Health tip state and controls
 */
export function useHealthTip(): UseHealthTipReturn {
  const [healthTip, setHealthTip] = useState<HealthTip | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if cached tip is still valid (less than 24 hours old)
   */
  const isCacheValid = (timestamp: number): boolean => {
    const now = Date.now();
    return now - timestamp < CACHE_DURATION;
  };

  /**
   * Load health tip from cache
   */
  const loadFromCache = async (): Promise<HealthTip | null> => {
    try {
      const cachedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!cachedData) return null;

      const parsed: CachedHealthTip = JSON.parse(cachedData);

      // Check if cache is still valid
      if (isCacheValid(parsed.timestamp)) {
        return parsed.tip;
      }

      // Cache expired, clear it
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    } catch (error) {
      console.error('Failed to load health tip from cache:', error);
      return null;
    }
  };

  /**
   * Save health tip to cache
   */
  const saveToCache = async (tip: HealthTip): Promise<void> => {
    try {
      const cacheData: CachedHealthTip = {
        tip,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save health tip to cache:', error);
    }
  };

  /**
   * Fetch new health tip from API
   * Note: fetchHealthTip already handles errors and returns fallback, so this always succeeds
   */
  const fetchNewTip = async (): Promise<HealthTip> => {
    const tip = await fetchHealthTip(); // Already has fallback logic
    await saveToCache(tip);
    return tip;
  };

  /**
   * Load health tip (from cache or API)
   */
  const loadHealthTip = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to load from cache first
      const cachedTip = await loadFromCache();
      if (cachedTip) {
        setHealthTip(cachedTip);
        setIsLoading(false);
        return;
      }

      // Cache miss or expired, fetch new tip
      const newTip = await fetchNewTip();
      setHealthTip(newTip);
    } catch (err) {
      // This should rarely happen since fetchHealthTip has fallbacks
      // Set fallback tip as last resort
      const fallbacks = getFallbackHealthTips();
      const fallbackTip = fallbacks[0];
      if (fallbackTip) {
        setHealthTip(fallbackTip);
      }
      // Don't set error state - user doesn't need to see this
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manually refresh health tip (ignores cache)
   */
  const refreshTip = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Clear existing cache
      await AsyncStorage.removeItem(STORAGE_KEY);

      // Fetch new tip
      const newTip = await fetchNewTip();
      setHealthTip(newTip);
    } catch (err) {
      // This should rarely happen since fetchHealthTip has fallbacks
      // Keep current tip or use fallback
      if (!healthTip) {
        const fallbacks = getFallbackHealthTips();
        const fallbackTip = fallbacks[0];
        if (fallbackTip) {
          setHealthTip(fallbackTip);
        }
      }
      // Don't set error state - user doesn't need to see this
    } finally {
      setIsLoading(false);
    }
  };

  // Load health tip on mount
  useEffect(() => {
    loadHealthTip();
  }, []);

  return {
    healthTip,
    isLoading,
    error,
    refreshTip,
  };
}
