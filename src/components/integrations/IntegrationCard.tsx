import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Trash2, 
  Copy, 
  ExternalLink, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface IntegrationCardProps {
  icon: React.ReactNode;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error' | 'syncing';
  isActive: boolean;
  stats?: {
    label: string;
    value: string | number;
  }[];
  lastActivity?: string;
  onToggle: () => void;
  onTest?: () => void;
  onDelete: () => void;
  onCopy?: () => void;
  copyValue?: string;
  children?: React.ReactNode;
}

const statusConfig = {
  active: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
    label: 'Connected'
  },
  inactive: {
    icon: AlertCircle,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    label: 'Inactive'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
    label: 'Error'
  },
  syncing: {
    icon: Loader2,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    label: 'Syncing'
  }
};

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  icon,
  name,
  description,
  status,
  isActive,
  stats,
  lastActivity,
  onToggle,
  onTest,
  onDelete,
  onCopy,
  copyValue,
  children
}) => {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      !isActive && "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon and Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn(
              "p-2.5 rounded-lg shrink-0",
              statusInfo.bg
            )}>
              {icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{name}</h3>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs shrink-0",
                    statusInfo.color
                  )}
                >
                  <StatusIcon className={cn(
                    "h-3 w-3 mr-1",
                    status === 'syncing' && "animate-spin"
                  )} />
                  {statusInfo.label}
                </Badge>
              </div>
              
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {description}
                </p>
              )}

              {/* Stats Row */}
              {stats && stats.length > 0 && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <span className="font-medium text-foreground">{stat.value}</span>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                  {lastActivity && (
                    <div className="flex items-center gap-1">
                      <span>Last: {lastActivity}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={isActive}
              onCheckedChange={onToggle}
              aria-label={`Toggle ${name}`}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onTest && (
                  <DropdownMenuItem onClick={onTest}>
                    <Play className="h-4 w-4 mr-2" />
                    Test Connection
                  </DropdownMenuItem>
                )}
                {onCopy && copyValue && (
                  <DropdownMenuItem onClick={onCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </DropdownMenuItem>
                )}
                {copyValue && (
                  <DropdownMenuItem onClick={() => window.open(copyValue, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open URL
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Optional Children (expanded content) */}
        {children && (
          <div className="mt-4 pt-4 border-t">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
