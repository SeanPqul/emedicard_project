import { useEffect, useState, useRef } from 'react';
import { InteractionManager } from 'react-native';
import { useNetwork } from '../../hooks/useNetwork';

/**
 * Deferred Loading Utilities
 * 
 * Implements mobile optimization patterns:
 * - Defer non-critical calls until after first paint
 * - Prioritize calls when on Wi-Fi vs cellular
 * - Smart scheduling based on device performance
 */

interface DeferredLoadingOptions {
  /**
   * Minimum delay before allowing load (ms)
   * Default: 100ms for interactions to settle
   */
  minDelay?: number;
  
  /**
   * Whether to only load on Wi-Fi for heavy operations
   * Default: false
   */
  wifiOnly?: boolean;
  
  /**
   * Priority level (higher numbers load first)
   * Default: 0
   */
  priority?: number;
  
  /**
   * Whether this operation is considered heavy/expensive
   * Heavy operations are deferred more aggressively
   * Default: false
   */
  isHeavy?: boolean;
  
  /**
   * Dependency array - defer until these are resolved
   */
  dependencies?: Array<any>;
}

interface DeferredState {
  shouldLoad: boolean;
  canLoadHeavy: boolean;
  networkCondition: 'wifi' | 'cellular' | 'offline';
}

/**
 * Hook to defer non-critical operations until after first paint
 */
export function useDeferredLoading(options: DeferredLoadingOptions = {}): DeferredState {
  const {
    minDelay = 100,
    wifiOnly = false,
    priority = 0,
    isHeavy = false,
    dependencies = []
  } = options;
  
  const { isConnected, isWifiConnected } = useNetwork();
  const [shouldLoad, setShouldLoad] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // Determine network condition
  const networkCondition = isWifiConnected ? 'wifi' : isConnected ? 'cellular' : 'offline';
  
  // Check if we can load heavy operations
  const canLoadHeavy = isWifiConnected || (!wifiOnly && isConnected);
  
  // Check if dependencies are ready
  const dependenciesReady = dependencies.every(dep => dep !== undefined && dep !== null);
  
  useEffect(() => {
    // Don't load if offline or dependencies not ready
    if (!isConnected || !dependenciesReady) {
      setShouldLoad(false);
      return;
    }
    
    // For heavy operations, respect Wi-Fi only setting
    if (isHeavy && wifiOnly && !isWifiConnected) {
      setShouldLoad(false);
      return;
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Calculate delay based on priority and whether it's heavy
    const baseDelay = minDelay;
    const priorityDelay = Math.max(0, (10 - priority) * 50); // Higher priority = less delay
    const heavyDelay = isHeavy ? 500 : 0; // Heavy operations get extra delay
    const totalDelay = baseDelay + priorityDelay + heavyDelay;
    
    // Use InteractionManager to wait for interactions to complete
    const task = InteractionManager.runAfterInteractions(() => {
      timeoutRef.current = setTimeout(() => {
        setShouldLoad(true);
      }, totalDelay);
    });
    
    return () => {
      task.cancel();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isConnected, isWifiConnected, dependenciesReady, minDelay, priority, isHeavy, wifiOnly]);
  
  // Reset when network conditions change significantly
  useEffect(() => {
    if (!isConnected) {
      setShouldLoad(false);
    }
  }, [isConnected]);
  
  return {
    shouldLoad,
    canLoadHeavy,
    networkCondition,
  };
}

/**
 * Hook for progressive loading with multiple phases
 */
export function useProgressiveLoading(phases: Array<DeferredLoadingOptions> = []) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phasesReady, setPhasesReady] = useState<boolean[]>(new Array(phases.length).fill(false));
  
  // Create deferred loading state for each phase
  const phaseStates = phases.map((phase, index) => 
    useDeferredLoading({
      ...phase,
      dependencies: index > 0 ? [phasesReady[index - 1]] : phase.dependencies,
    })
  );
  
  // Update phases as they become ready
  useEffect(() => {
    phaseStates.forEach((state, index) => {
      if (state.shouldLoad && !phasesReady[index]) {
        setPhasesReady(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
        
        if (index === currentPhase) {
          setCurrentPhase(Math.min(phases.length - 1, index + 1));
        }
      }
    });
  }, [phaseStates, currentPhase, phasesReady, phases.length]);
  
  return {
    currentPhase,
    phasesReady,
    canLoadPhase: (phaseIndex: number) => phasesReady[phaseIndex] || false,
    networkCondition: phaseStates[0]?.networkCondition || 'offline',
  };
}

/**
 * Utility class for managing deferred operations
 */
class DeferredOperationManager {
  private operations = new Map<string, {
    priority: number;
    isHeavy: boolean;
    wifiOnly: boolean;
    callback: () => void;
  }>();
  
  private scheduled = false;
  
  /**
   * Register an operation to be executed later
   */
  register(id: string, callback: () => void, options: DeferredLoadingOptions = {}) {
    this.operations.set(id, {
      priority: options.priority || 0,
      isHeavy: options.isHeavy || false,
      wifiOnly: options.wifiOnly || false,
      callback,
    });
    
    this.scheduleExecution();
  }
  
  /**
   * Remove an operation
   */
  unregister(id: string) {
    this.operations.delete(id);
  }
  
  /**
   * Execute all operations based on priority and network conditions
   */
  private scheduleExecution() {
    if (this.scheduled || this.operations.size === 0) return;
    
    this.scheduled = true;
    
    InteractionManager.runAfterInteractions(() => {
      // Sort operations by priority (highest first)
      const sortedOperations = Array.from(this.operations.entries())
        .sort((a, b) => b[1].priority - a[1].priority);
      
      // Execute operations with appropriate delays
      sortedOperations.forEach(([id, operation], index) => {
        const delay = index * 100; // Stagger operations
        
        setTimeout(() => {
          try {
            operation.callback();
          } catch (error) {
            console.warn(`Deferred operation "${id}" failed:`, error);
          } finally {
            this.operations.delete(id);
          }
        }, delay);
      });
      
      this.scheduled = false;
    });
  }
  
  /**
   * Clear all pending operations
   */
  clear() {
    this.operations.clear();
    this.scheduled = false;
  }
  
  /**
   * Get statistics about pending operations
   */
  getStats() {
    const total = this.operations.size;
    const heavy = Array.from(this.operations.values()).filter(op => op.isHeavy).length;
    const wifiOnly = Array.from(this.operations.values()).filter(op => op.wifiOnly).length;
    
    return { total, heavy, wifiOnly };
  }
}

// Export singleton manager
export const deferredOperationManager = new DeferredOperationManager();

/**
 * High-level hook for common deferred loading patterns
 */
export function useDeferredQuery<T>(
  queryFn: () => T | undefined,
  options: DeferredLoadingOptions = {}
): {
  data: T | undefined;
  isDeferred: boolean;
  canLoad: boolean;
} {
  const { shouldLoad, canLoadHeavy } = useDeferredLoading(options);
  const [data, setData] = useState<T | undefined>(undefined);
  
  const canLoad = options.isHeavy ? canLoadHeavy && shouldLoad : shouldLoad;
  
  useEffect(() => {
    if (canLoad && !data) {
      try {
        const result = queryFn();
        setData(result);
      } catch (error) {
        console.warn('Deferred query failed:', error);
      }
    }
  }, [canLoad, queryFn, data]);
  
  return {
    data,
    isDeferred: !shouldLoad,
    canLoad,
  };
}

/**
 * Predefined loading strategies for common use cases
 */
export const LoadingStrategies = {
  // Critical data that should load immediately
  CRITICAL: { priority: 10, minDelay: 0 },
  
  // Important data that loads after critical
  IMPORTANT: { priority: 5, minDelay: 100 },
  
  // Nice-to-have data that can wait
  DEFERRED: { priority: 1, minDelay: 500 },
  
  // Heavy operations that should only run on Wi-Fi
  WIFI_ONLY_HEAVY: { 
    priority: 1, 
    minDelay: 1000, 
    wifiOnly: true, 
    isHeavy: true 
  },
  
  // Background updates
  BACKGROUND: { 
    priority: 0, 
    minDelay: 2000, 
    isHeavy: false 
  },
} as const;
