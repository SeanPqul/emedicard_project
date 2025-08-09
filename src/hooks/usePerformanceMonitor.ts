import { useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  interactionTime: number;
  mounted: boolean;
}

// Custom hook for monitoring component performance
export const usePerformanceMonitor = (componentName: string) => {
  const mountTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);
  const metrics = useRef<PerformanceMetrics>({
    componentName,
    renderTime: 0,
    interactionTime: 0,
    mounted: false,
  });

  useEffect(() => {
    // Record mount time
    const startTime = mountTime.current;
    metrics.current.mounted = true;

    // Wait for interactions to complete
    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      metrics.current.interactionTime = totalTime;
      
      if (__DEV__) {
        console.log(`[Performance] ${componentName} ready in ${totalTime}ms`);
      }
    });

    return () => {
      // Cleanup
      interactionHandle.cancel();
      metrics.current.mounted = false;
      
      if (__DEV__ && renderCount.current > 10) {
        console.warn(
          `[Performance] ${componentName} rendered ${renderCount.current} times. Consider optimization.`
        );
      }
    };
  }, [componentName]);

  useEffect(() => {
    // Track render count
    renderCount.current += 1;
    const renderStartTime = Date.now();
    
    // Use setTimeout to measure render time after current render cycle
    const timeoutId = setTimeout(() => {
      const renderEndTime = Date.now();
      metrics.current.renderTime = renderEndTime - renderStartTime;
      
      if (__DEV__ && metrics.current.renderTime > 16) {
        console.warn(
          `[Performance] ${componentName} slow render: ${metrics.current.renderTime}ms`
        );
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  });

  return {
    renderCount: renderCount.current,
    metrics: metrics.current,
  };
};

// Hook for tracking async operations
export const useAsyncPerformance = (operationName: string) => {
  const startTimeRef = useRef<number | null>(null);

  const startTracking = () => {
    startTimeRef.current = Date.now();
    if (__DEV__) {
      console.log(`[AsyncPerformance] ${operationName} started`);
    }
  };

  const endTracking = (success = true) => {
    if (startTimeRef.current) {
      const duration = Date.now() - startTimeRef.current;
      if (__DEV__) {
        console.log(
          `[AsyncPerformance] ${operationName} ${success ? 'completed' : 'failed'} in ${duration}ms`
        );
      }
      startTimeRef.current = null;
      return duration;
    }
    return 0;
  };

  return { startTracking, endTracking };
};
