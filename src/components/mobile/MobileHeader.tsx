import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  actions?: MobileHeaderAction[];
  rightContent?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'transparent';
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  actions,
  rightContent,
  className,
  variant = 'default',
}) => {
  return (
    <header
      className={cn(
        'flex items-center gap-2 px-4 py-3 min-h-[56px]',
        variant === 'default' && 'bg-background border-b border-border/50',
        variant === 'transparent' && 'bg-transparent',
        className
      )}
    >
      {/* Back Button */}
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-9 px-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only md:not-sr-only md:ml-1">{backLabel}</span>
        </Button>
      )}

      {/* Title Area */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>

      {/* Right Content */}
      {rightContent}

      {/* Actions Menu */}
      {actions && actions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {actions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={action.onClick}
                className={cn(
                  action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                )}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};

export default MobileHeader;
