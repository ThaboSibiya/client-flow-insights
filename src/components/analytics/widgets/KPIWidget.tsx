
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

const colorMap = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-green-500/10 text-green-600',
  warning: 'bg-amber-500/10 text-amber-600',
  danger: 'bg-red-500/10 text-red-600'
};

const KPIWidget: React.FC<KPIWidgetProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'default'
}) => {
  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-sm text-muted-foreground font-medium truncate">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={cn("p-2.5 rounded-lg flex-shrink-0", colorMap[color])}>
              {icon}
            </div>
          )}
        </div>
        
        {trend && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              {trend.direction === 'up' && (
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              )}
              {trend.direction === 'down' && (
                <TrendingDown className="h-3.5 w-3.5 text-red-600" />
              )}
              {trend.direction === 'neutral' && (
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className={cn(
                "text-xs font-medium",
                trend.direction === 'up' && "text-green-600",
                trend.direction === 'down' && "text-red-600",
                trend.direction === 'neutral' && "text-muted-foreground"
              )}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPIWidget;
