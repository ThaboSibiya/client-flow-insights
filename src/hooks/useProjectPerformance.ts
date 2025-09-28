import { useCallback, useRef, useState, useEffect } from 'react';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
}

export interface UseProjectPerformanceReturn {
  metrics: PerformanceMetric[];
  startMeasure: (name: string) => () => void;
  clearMetrics: () => void;
  averageTime: (name: string) => number;
}

export const useProjectPerformance = (): UseProjectPerformanceReturn => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const startMeasure = useCallback((name: string) => {
    const startTime = performance.now();
    timersRef.current.set(name, startTime);

    return () => {
      const endTime = performance.now();
      const startTimeValue = timersRef.current.get(name);
      
      if (startTimeValue !== undefined) {
        const duration = endTime - startTimeValue;
        
        setMetrics(prev => [...prev, {
          name,
          duration,
          timestamp: new Date()
        }]);

        timersRef.current.delete(name);

        // Log slow operations in development
        if (process.env.NODE_ENV === 'development' && duration > 100) {
          console.warn(`Slow project operation: ${name} took ${duration.toFixed(2)}ms`);
        }
      }
    };
  }, []);

  const clearMetrics = useCallback((): void => {
    setMetrics([]);
  }, []);

  const averageTime = useCallback((name: string): number => {
    const relevantMetrics = metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / relevantMetrics.length;
  }, [metrics]);

  // Clean up old metrics every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      setMetrics(prev => prev.filter(m => m.timestamp > fiveMinutesAgo));
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    startMeasure,
    clearMetrics,
    averageTime
  };
};