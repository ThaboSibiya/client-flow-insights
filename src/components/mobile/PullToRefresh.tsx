import React from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePullRefresh } from '@/hooks/use-pull-refresh';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  disabled = false,
  className,
}) => {
  const { isRefreshing, pullDistance, isPulling, handlers } = usePullRefresh({
    onRefresh,
    threshold: 80,
    disabled,
  });

  const progress = Math.min(pullDistance / 80, 1);
  const rotation = progress * 360;
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div className={cn('relative', className)} {...handlers}>
      {/* Refresh Indicator */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-10 transition-all',
          showIndicator ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          top: Math.min(pullDistance - 40, 20),
        }}
      >
        <div
          className={cn(
            'h-10 w-10 rounded-full bg-background shadow-md border border-border flex items-center justify-center',
            isRefreshing && 'animate-spin'
          )}
          style={{
            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
          }}
        >
          <RefreshCw
            className={cn(
              'h-5 w-5 text-primary transition-colors',
              progress >= 1 && 'text-green-500'
            )}
          />
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform"
        style={{
          transform: isPulling ? `translateY(${pullDistance}px)` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
