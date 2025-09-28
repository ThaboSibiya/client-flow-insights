import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Accessible Button with enhanced features
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  children: React.ReactNode;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={className}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="sr-only">Loading...</span>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          </>
        ) : null}
        {children}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

// Accessible Form Field with proper labeling
interface AccessibleFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

export const AccessibleField: React.FC<AccessibleFieldProps> = ({
  label,
  error,
  hint,
  required,
  children,
  className
}) => {
  const fieldId = useId();
  const errorId = useId();
  const hintId = useId();

  const childWithProps = React.cloneElement(children, {
    id: fieldId,
    'aria-invalid': !!error,
    'aria-describedby': cn(
      hint && hintId,
      error && errorId
    ).trim() || undefined,
    'aria-required': required,
  });

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>
      
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      
      {childWithProps}
      
      {error && (
        <p 
          id={errorId} 
          className="text-sm text-destructive" 
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible Search Input
interface AccessibleSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  searchResults?: number;
  isSearching?: boolean;
}

export const AccessibleSearch = forwardRef<HTMLInputElement, AccessibleSearchProps>(
  ({ className, onSearch, searchResults, isSearching, onChange, ...props }, ref) => {
    const searchId = useId();
    const statusId = useId();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onSearch?.(e.target.value);
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={searchId}
          type="search"
          role="searchbox"
          aria-describedby={statusId}
          className={cn('pr-10', className)}
          onChange={handleChange}
          {...props}
        />
        
        <div 
          id={statusId}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {isSearching && 'Searching...'}
          {!isSearching && searchResults !== undefined && (
            `${searchResults} result${searchResults !== 1 ? 's' : ''} found`
          )}
        </div>
      </div>
    );
  }
);

AccessibleSearch.displayName = 'AccessibleSearch';

// Accessible Modal/Dialog wrapper
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className
}) => {
  const titleId = useId();
  const contentId = useId();

  React.useEffect(() => {
    if (isOpen) {
      // Focus trap and escape key handling
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={contentId}
    >
      <div className={cn(
        "fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-background border rounded-lg shadow-lg",
        className
      )}>
        <div className="sr-only" id={titleId}>
          {title}
        </div>
        <div id={contentId}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Accessible Status/Alert component
interface AccessibleStatusProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const AccessibleStatus: React.FC<AccessibleStatusProps> = ({
  type,
  message,
  dismissible,
  onDismiss,
  className
}) => {
  const roleMap = {
    info: 'status',
    success: 'status',
    warning: 'alert',
    error: 'alert'
  } as const;

  const colorMap = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    success: 'border-green-200 bg-green-50 text-green-900', 
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    error: 'border-red-200 bg-red-50 text-red-900'
  } as const;

  return (
    <div
      role={roleMap[type]}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'p-4 border rounded-lg flex items-center justify-between',
        colorMap[type],
        className
      )}
    >
      <span>{message}</span>
      
      {dismissible && (
        <AccessibleButton
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="ml-4"
        >
          ✕
        </AccessibleButton>
      )}
    </div>
  );
};

// Skip Link for keyboard navigation
export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({ 
  href, 
  children 
}) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
  >
    {children}
  </a>
);