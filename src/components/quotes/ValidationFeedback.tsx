
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle, X } from "lucide-react";
import { ValidationError } from '@/utils/quoteValidation';

interface ValidationFeedbackProps {
  errors: ValidationError[];
  onDismissError?: (index: number) => void;
  className?: string;
}

const ValidationFeedback = ({ errors, onDismissError, className = "" }: ValidationFeedbackProps) => {
  const errorCount = errors.filter(e => e.type === 'error').length;
  const warningCount = errors.filter(e => e.type === 'warning').length;

  if (errors.length === 0) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          All validations passed. Your quote is ready to save.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Summary */}
      <div className="flex items-center gap-2 mb-3">
        {errorCount > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errorCount} Error{errorCount !== 1 ? 's' : ''}
          </Badge>
        )}
        {warningCount > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3" />
            {warningCount} Warning{warningCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Error List */}
      <div className="space-y-2">
        {errors.map((error, index) => (
          <Alert
            key={index}
            className={
              error.type === 'error'
                ? "border-red-200 bg-red-50"
                : "border-yellow-200 bg-yellow-50"
            }
          >
            {error.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <div className="flex justify-between items-start w-full">
              <AlertDescription
                className={
                  error.type === 'error' ? "text-red-800" : "text-yellow-800"
                }
              >
                <span className="font-medium">
                  {error.field.includes('[') 
                    ? error.field.replace(/\[(\d+)\]/, ' #$1').replace(/\./g, ' ')
                    : error.field.charAt(0).toUpperCase() + error.field.slice(1).replace(/([A-Z])/g, ' $1')
                  }:
                </span>{' '}
                {error.message}
              </AlertDescription>
              {onDismissError && error.type === 'warning' && (
                <button
                  onClick={() => onDismissError(index)}
                  className="ml-2 text-yellow-600 hover:text-yellow-800 transition-colors"
                  aria-label="Dismiss warning"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </Alert>
        ))}
      </div>

      {errorCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            <strong>Cannot save:</strong> Please fix all errors before saving your quote.
          </p>
        </div>
      )}
    </div>
  );
};

export default ValidationFeedback;
