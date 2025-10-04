import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * useNetwork Hook
 * 
 * React hook for monitoring network connectivity status.
 * Provides network state and utilities for network-aware components.
 */

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

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

  const handleNetworkChange = useCallback((state: NetInfoState) => {
    setNetworkState({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type || 'unknown',
    });
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const state = await NetInfo.fetch();
      handleNetworkChange(state);
    } catch (error) {
      console.warn('Failed to check network connection:', error);
      setNetworkState({
        isConnected: false,
        isInternetReachable: false,
        type: 'unknown',
      });
    }
  }, [handleNetworkChange]);

  useEffect(() => {
    // Initial network check
    checkConnection();

    // Set up network listener
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    // Clean up listener on unmount
    return () => {
      unsubscribe();
    };
  }, [checkConnection, handleNetworkChange]);

  return {
    networkState,
    isConnected: networkState.isConnected,
    isOnline: networkState.isConnected && networkState.isInternetReachable,
    checkConnection,
  };
};
