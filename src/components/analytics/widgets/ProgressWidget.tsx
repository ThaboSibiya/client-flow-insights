
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProgressWidgetProps {
  title: string;
  value: number;
  max?: number;
  target?: number;
  color?: 'default' | 'success' | 'warning' | 'danger';
  showPercentage?: boolean;
  subtitle?: string;
}

const colorMap = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500'
};

const bgColorMap = {
  default: 'bg-primary/20',
  success: 'bg-green-500/20',
  warning: 'bg-amber-500/20',
  danger: 'bg-red-500/20'
};

const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  title,
  value,
  max = 100,
  target,
  color = 'default',
  showPercentage = true,
  subtitle
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const targetPercentage = target ? (target / max) * 100 : null;

  // Auto-determine color based on progress if not specified
  const autoColor = (): typeof color => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    if (percentage < 30) return 'danger';
    return 'default';
  };

  const finalColor = color === 'default' ? autoColor() : color;

  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {showPercentage && (
            <span className={cn(
              "text-lg font-bold",
              finalColor === 'success' && 'text-green-600',
              finalColor === 'warning' && 'text-amber-600',
              finalColor === 'danger' && 'text-red-600',
              finalColor === 'default' && 'text-primary'
            )}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
        
        <div className="relative">
          <div className={cn("h-2.5 rounded-full", bgColorMap[finalColor])}>
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                colorMap[finalColor]
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          {targetPercentage && (
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-foreground/50"
              style={{ left: `${targetPercentage}%` }}
              title={`Target: ${target}`}
            />
          )}
        </div>

        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{value.toLocaleString()} / {max.toLocaleString()}</span>
          {target && (
            <span>Target: {target.toLocaleString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressWidget;
