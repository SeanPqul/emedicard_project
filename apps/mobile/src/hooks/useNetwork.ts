import { useState, useEffect, useCallback } from 'react';
import { addNetworkListener, NetworkState, isOnline } from '../lib/network';

/**
 * useNetwork Hook
 * 
 * React hook for monitoring network connectivity status.
 * Provides network state and utilities for network-aware components.
 */

export interface UseNetworkReturn {
  networkState: NetworkState;
  isConnected: boolean;
  isOnline: boolean;
  checkConnection: () => Promise<void>;
}

export const useNetwork = (): UseNetworkReturn => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true, // Optimistic default
    isInternetReachable: true,
    type: 'unknown',
  });

  const checkConnection = useCallback(async () => {
    try {
      const online = await isOnline();
      setNetworkState(prev => ({
        ...prev,
        isConnected: online,
        isInternetReachable: online,
      }));
    } catch (error) {
      console.warn('Failed to check network connection:', error);
      setNetworkState(prev => ({
        ...prev,
        isConnected: false,
        isInternetReachable: false,
      }));
    }
  }, []);

  useEffect(() => {
    // Initial network check
    checkConnection();

    // Set up network listener
    const unsubscribe = addNetworkListener((state) => {
      setNetworkState(state);
    });

    // Clean up listener on unmount
    return unsubscribe;
  }, [checkConnection]);

  return {
    networkState,
    isConnected: networkState.isConnected,
    isOnline: networkState.isConnected && networkState.isInternetReachable,
    checkConnection,
  };
};
