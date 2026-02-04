import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/use-haptic';

interface SwipeAction {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  className,
  threshold = 80,
  disabled = false,
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const { selection } = useHaptic();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Apply resistance at edges
    const maxSwipe = threshold * 1.2;
    const resistedDiff = Math.sign(diff) * Math.min(Math.abs(diff) * 0.6, maxSwipe);
    
    // Only allow swipe if there are actions in that direction
    if (diff > 0 && leftActions.length === 0) return;
    if (diff < 0 && rightActions.length === 0) return;
    
    setTranslateX(resistedDiff);
  }, [isDragging, disabled, threshold, leftActions.length, rightActions.length]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (Math.abs(translateX) >= threshold) {
      selection();
      
      if (translateX > 0 && leftActions.length > 0) {
        leftActions[0].onClick();
      } else if (translateX < 0 && rightActions.length > 0) {
        rightActions[0].onClick();
      }
    }
    
    setTranslateX(0);
  }, [isDragging, translateX, threshold, leftActions, rightActions, selection]);

  const actionWidth = Math.abs(translateX);
  const showLeftActions = translateX > 20 && leftActions.length > 0;
  const showRightActions = translateX < -20 && rightActions.length > 0;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Left Actions Background */}
      {leftActions.length > 0 && (
        <div
          className={cn(
            'absolute inset-y-0 left-0 flex items-center justify-start transition-opacity',
            leftActions[0]?.bgColor || 'bg-green-500'
          )}
          style={{ 
            width: actionWidth,
            opacity: showLeftActions ? 1 : 0 
          }}
        >
          {showLeftActions && (
            <div className="flex items-center gap-1 px-3 text-white">
              {leftActions[0]?.icon}
              <span className="text-xs font-medium">{leftActions[0]?.label}</span>
            </div>
          )}
        </div>
      )}

      {/* Right Actions Background */}
      {rightActions.length > 0 && (
        <div
          className={cn(
            'absolute inset-y-0 right-0 flex items-center justify-end transition-opacity',
            rightActions[0]?.bgColor || 'bg-blue-500'
          )}
          style={{ 
            width: actionWidth,
            opacity: showRightActions ? 1 : 0 
          }}
        >
          {showRightActions && (
            <div className="flex items-center gap-1 px-3 text-white">
              <span className="text-xs font-medium">{rightActions[0]?.label}</span>
              {rightActions[0]?.icon}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div
        className={cn(
          'relative bg-background transition-transform',
          !isDragging && 'transition-all duration-200'
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableRow;
