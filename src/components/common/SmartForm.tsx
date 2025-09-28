import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';

export interface SmartFormProps<T> {
  initialData?: Partial<T>;
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  children: (props: {
    data: Partial<T>;
    errors: { [key: string]: string };
    isSubmitting: boolean;
    isDirty: boolean;
    isValid: boolean;
    setValue: (key: keyof T, value: any) => void;
    setData: (data: Partial<T>) => void;
    clearErrors: () => void;
    validateField: (key: keyof T) => void;
    validateForm: () => boolean;
  }) => React.ReactNode;
  showSuccessMessage?: boolean;
  successMessage?: string;
  enableOptimisticUpdates?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export const SmartForm = <T extends Record<string, any>>({
  initialData = {},
  schema,
  onSubmit,
  onCancel,
  children,
  showSuccessMessage = true,
  successMessage = 'Form submitted successfully',
  enableOptimisticUpdates = false,
  autoSave = false,
  autoSaveDelay = 2000,
}: SmartFormProps<T>) => {
  const [data, setData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<Partial<T>>(initialData);
  const [optimisticUpdate, setOptimisticUpdate] = useState<Partial<T> | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !isDirty) return;

    const saveTimer = setTimeout(async () => {
      try {
        const validationResult = schema.safeParse(data);
        if (validationResult.success) {
          await onSubmit(validationResult.data);
          setLastSavedData(data);
          setIsDirty(false);
          
          toast({
            title: "Auto-saved",
            description: "Your changes have been saved automatically",
          });
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, autoSaveDelay);

    return () => clearTimeout(saveTimer);
  }, [data, isDirty, autoSave, autoSaveDelay, schema, onSubmit]);

  // Check if form is valid
  const isValid = useCallback(() => {
    const result = schema.safeParse(data);
    return result.success;
  }, [data, schema]);

  // Validate a single field
  const validateField = useCallback((key: keyof T) => {
    try {
      // For single field validation, we'll validate the entire form and extract errors
      schema.parse(data);
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key as string];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => err.path[0] === key);
        if (fieldError) {
          setErrors(prev => ({
            ...prev,
            [key as string]: fieldError.message,
          }));
        }
      }
    }
  }, [data, schema]);

  // Validate entire form
  const validateForm = useCallback(() => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [data, schema]);

  // Set a single field value
  const setValue = useCallback((key: keyof T, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
    
    // Clear error for this field
    if (errors[key as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key as string];
        return newErrors;
      });
    }
  }, [errors]);

  // Set entire data object
  const setFormData = useCallback((newData: Partial<T>) => {
    setData(newData);
    setIsDirty(true);
    setErrors({});
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const validatedData = schema.parse(data);

      // Optimistic update
      if (enableOptimisticUpdates) {
        setOptimisticUpdate(validatedData);
      }

      await onSubmit(validatedData);

      if (showSuccessMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }

      setLastSavedData(data);
      setIsDirty(false);
      setOptimisticUpdate(null);

    } catch (error) {
      // Rollback optimistic update
      if (enableOptimisticUpdates) {
        setOptimisticUpdate(null);
      }

      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [data, schema, onSubmit, validateForm, enableOptimisticUpdates, showSuccessMessage, successMessage]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (isDirty) {
      const shouldCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!shouldCancel) return;
    }

    setData(initialData);
    setErrors({});
    setIsDirty(false);
    setOptimisticUpdate(null);
    onCancel?.();
  }, [isDirty, initialData, onCancel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSubmit();
        } else if (e.key === 'z' && !e.shiftKey) {
          // Could implement undo functionality
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  // Display data (with optimistic updates)
  const displayData = optimisticUpdate || data;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {children({
        data: displayData,
        errors,
        isSubmitting,
        isDirty,
        isValid: isValid(),
        setValue,
        setData: setFormData,
        clearErrors,
        validateField,
        validateForm,
      })}

      {/* Form status indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isDirty && (
            <div className="flex items-center text-sm text-amber-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unsaved changes
            </div>
          )}
          
          {autoSave && !isDirty && (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Auto-saved
            </div>
          )}

          {optimisticUpdate && (
            <div className="flex items-center text-sm text-blue-600">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Saving...
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting || !isValid() || (!isDirty && !optimisticUpdate)}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-muted-foreground text-center">
        Press Ctrl+S to save quickly
      </div>
    </form>
  );
};