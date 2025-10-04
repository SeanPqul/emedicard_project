/**
 * useNetworkStatus Hook
 * 
 * Shared hook for monitoring network connectivity status
 */

import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isWifi: boolean;
  isCellular: boolean;
  isOffline: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    isWifi: false,
    isCellular: false,
    isOffline: false,
    connectionQuality: 'unknown',
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(handleNetworkChange);

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleNetworkChange = (state: NetInfoState) => {
    const isConnected = state.isConnected ?? false;
    const isInternetReachable = state.isInternetReachable;
    const type = state.type;
    const isWifi = type === 'wifi';
    const isCellular = type === 'cellular';
    const isOffline = !isConnected || isInternetReachable === false;

    // Determine connection quality based on available information
    let connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown' = 'unknown';
    
    if (isOffline) {
      connectionQuality = 'poor';
    } else if (isWifi) {
      connectionQuality = 'excellent';
    } else if (isCellular) {
      // Could potentially check cellular generation (3G, 4G, 5G) if available
      connectionQuality = 'good';
    } else if (isConnected && isInternetReachable === true) {
      connectionQuality = 'good';
    }

    setNetworkStatus({
      isConnected,
      isInternetReachable,
      type,
      isWifi,
      isCellular,
      isOffline,
      connectionQuality,
    });

    setIsLoading(false);
  };

  const refresh = async (): Promise<NetworkStatus> => {
    const state = await NetInfo.fetch();
    handleNetworkChange(state);
    return networkStatus;
  };

  return {
    ...networkStatus,
    isLoading,
    refresh,
  };
};

export default useNetworkStatus;
