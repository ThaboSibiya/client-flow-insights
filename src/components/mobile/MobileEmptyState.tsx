import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const MobileEmptyState: React.FC<MobileEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-8 w-8 text-muted-foreground',
        })}
      </div>
      
      <h3 className="text-base font-semibold text-foreground mb-1">
        {title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {description}
      </p>
      
      {action && (
        <Button onClick={action.onClick} className="min-w-[140px]">
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default MobileEmptyState;
