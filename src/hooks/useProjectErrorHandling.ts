import { useCallback, useState } from 'react';
import { toast } from '@/hooks/use-toast';

export interface ProjectErrorInfo {
  message: string;
  code?: string;
  context?: string;
  timestamp: Date;
}

export interface UseProjectErrorHandlingReturn {
  errors: ProjectErrorInfo[];
  logError: (error: unknown, context?: string) => void;
  clearErrors: () => void;
  clearError: (index: number) => void;
  hasErrors: boolean;
}

export const useProjectErrorHandling = (): UseProjectErrorHandlingReturn => {
  const [errors, setErrors] = useState<ProjectErrorInfo[]>([]);

  const logError = useCallback((error: unknown, context?: string): void => {
    const errorInfo: ProjectErrorInfo = {
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof Error ? error.name : undefined,
      context,
      timestamp: new Date()
    };

    setErrors(prev => [...prev, errorInfo]);

    // Show toast notification
    toast({
      title: "Project Error",
      description: errorInfo.message,
      variant: "destructive",
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`Project Error${context ? ` (${context})` : ''}:`, error);
    }
  }, []);

  const clearErrors = useCallback((): void => {
    setErrors([]);
  }, []);

  const clearError = useCallback((index: number): void => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const hasErrors = errors.length > 0;

  return {
    errors,
    logError,
    clearErrors,
    clearError,
    hasErrors
  };
};