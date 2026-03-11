import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProviderCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  isConfigured: boolean;
  isSelected: boolean;
  freeTier: string;
  onClick: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  name,
  description,
  icon,
  isActive,
  isConfigured,
  isSelected,
  freeTier,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex items-start gap-4 w-full rounded-xl border-2 p-4 text-left transition-all duration-200',
        'hover:shadow-md hover:border-primary/40',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card',
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -top-2.5 right-3">
          <Badge className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 font-semibold shadow-sm">
            ACTIVE
          </Badge>
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
        isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
      )}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-foreground">{name}</h4>
          {isConfigured && !isActive && (
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
        <p className="text-xs text-muted-foreground/70 mt-1.5 font-medium">{freeTier}</p>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground/50 mt-1 shrink-0" />
    </button>
  );
};

export default ProviderCard;
