// DISABLED: @react-native-community/netinfo due to native module linking issues
// import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import { AppError } from "./errors";
import { appStorage } from "./storage/mmkv";

// DISABLED: NetInfo functionality - always return false to use fallbacks
const isNetInfoAvailable = () => {
  return false; // Always use fallback implementations
};

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'other' | 'unknown';
}

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export async function getNetworkState(): Promise<NetworkState> {
  if (!isNetInfoAvailable()) {
    return {
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown'
    };
  }

  // DISABLED: NetInfo usage commented out
  // try {
  //   const state = await NetInfo.fetch();
  //   return {
  //     isConnected: !!state.isConnected,
  //     isInternetReachable: !!state.isInternetReachable,
  //     type: state.type || 'unknown'
  //   };
  // } catch (error) {
  //   console.warn('NetInfo fetch failed, using fallback:', error);
    return {
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown'
    };
  // }
}

export async function isOnline(): Promise<boolean> {
  if (!isNetInfoAvailable()) {
    return true;
  }

  // DISABLED: NetInfo usage commented out
  // try {
  //   const state = await NetInfo.fetch();
  //   const online = !!state.isConnected && !!state.isInternetReachable;
  //   if (appStorage) {
  //     appStorage.set("lastOnline", online ? "1" : "0");
  //   }
  //   return online;
  // } catch (error) {
  //   console.warn('NetInfo isOnline failed, using fallback:', error);
    return true;
  // }
}

export function addNetworkListener(callback: (state: NetworkState) => void): () => void {
  if (!isNetInfoAvailable()) {
    return () => {};
  }

  // DISABLED: NetInfo usage commented out
  // try {
  //   const unsubscribe = NetInfo.addEventListener(state => {
  //     callback({
  //       isConnected: !!state.isConnected,
  //       isInternetReachable: !!state.isInternetReachable,
  //       type: state.type || 'unknown'
  //     });
  //   });
  //   
  //   return unsubscribe;
  // } catch (error) {
  //   console.warn('NetInfo addEventListener failed, using fallback:', error);
    return () => {};
  // }
}

export async function withNetwork<T>(fn: () => Promise<T>): Promise<T> {
  if (!(await isOnline())) {
    throw new AppError("You are offline. Please check your connection.", "OFFLINE");
  }
  try { return await fn(); }
  catch (e: any) {
    if (e?.name === "AbortError") throw new AppError("Request timed out", "TIMEOUT");
    throw new AppError(e?.message || "Network error", "NETWORK");
  }
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  retries = 2,
  baseDelayMs = 400
): Promise<T> {
  let attempt = 0;
  let lastErr: any;
  while (attempt <= retries) {
    try { return await fn(); } 
    catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      const backoff = baseDelayMs * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, backoff));
      attempt++;
    }
  }
  throw lastErr;
}

/**
 * Enhanced retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> => {
  const config = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    ...options
  };

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === config.maxAttempts) throw error;
      
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Retry attempts exhausted');
};

/**
 * Optional network wrapper that doesn't throw on offline
 */
export const withNetworkOptional = async <T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T | null> => {
  try {
    return await withNetwork(operation);
  } catch (error) {
    console.warn('Optional network operation failed:', error);
    return null;
  }
};

/**
 * Check connection without throwing errors
 */
export const checkConnection = async (): Promise<NetworkState> => {
  try {
    return await getNetworkState();
  } catch (error) {
    console.warn('Failed to check network connection:', error);
    return {
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown'
    };
  }
};
