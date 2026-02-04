import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface MobileCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: {
    src?: string;
    fallback: string;
    className?: string;
  };
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  }>;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
}

const MobileCard: React.FC<MobileCardProps> = ({
  title,
  subtitle,
  description,
  avatar,
  badges,
  rightContent,
  showChevron = true,
  onClick,
  className,
  selected = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 bg-card border-b border-border/50 transition-colors',
        onClick && 'cursor-pointer active:bg-accent/50 hover:bg-accent/30',
        selected && 'bg-primary/5 border-l-2 border-l-primary',
        className
      )}
    >
      {/* Avatar */}
      {avatar && (
        <Avatar className={cn('h-11 w-11 flex-shrink-0', avatar.className)}>
          <AvatarImage src={avatar.src} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {avatar.fallback}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground truncate">
            {title}
          </h3>
          {badges && badges.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {badges.slice(0, 2).map((badge, index) => (
                <Badge
                  key={index}
                  variant={badge.variant || 'secondary'}
                  className={cn('text-[10px] px-1.5 py-0', badge.className)}
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {subtitle}
          </p>
        )}
        
        {description && (
          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
            {description}
          </p>
        )}
      </div>

      {/* Right Content */}
      {rightContent && (
        <div className="flex-shrink-0">{rightContent}</div>
      )}

      {/* Chevron */}
      {showChevron && onClick && (
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
      )}
    </div>
  );
};

export default MobileCard;
