
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

const ResponsiveGrid = ({ 
  children, 
  className, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 4, tablet: 6, desktop: 8 }
}: ResponsiveGridProps) => {
  const isMobile = useIsMobile();

  const gridClasses = cn(
    'grid',
    // Mobile columns
    cols.mobile === 1 && 'grid-cols-1',
    cols.mobile === 2 && 'grid-cols-2',
    cols.mobile === 3 && 'grid-cols-3',
    // Tablet columns
    cols.tablet && cols.tablet === 1 && 'md:grid-cols-1',
    cols.tablet && cols.tablet === 2 && 'md:grid-cols-2',
    cols.tablet && cols.tablet === 3 && 'md:grid-cols-3',
    cols.tablet && cols.tablet === 4 && 'md:grid-cols-4',
    // Desktop columns
    cols.desktop && cols.desktop === 1 && 'lg:grid-cols-1',
    cols.desktop && cols.desktop === 2 && 'lg:grid-cols-2',
    cols.desktop && cols.desktop === 3 && 'lg:grid-cols-3',
    cols.desktop && cols.desktop === 4 && 'lg:grid-cols-4',
    cols.desktop && cols.desktop === 5 && 'lg:grid-cols-5',
    cols.desktop && cols.desktop === 6 && 'lg:grid-cols-6',
    // Gap classes
    gap.mobile === 2 && 'gap-2',
    gap.mobile === 4 && 'gap-4',
    gap.mobile === 6 && 'gap-6',
    gap.tablet && gap.tablet === 4 && 'md:gap-4',
    gap.tablet && gap.tablet === 6 && 'md:gap-6',
    gap.tablet && gap.tablet === 8 && 'md:gap-8',
    gap.desktop && gap.desktop === 6 && 'lg:gap-6',
    gap.desktop && gap.desktop === 8 && 'lg:gap-8',
    gap.desktop && gap.desktop === 10 && 'lg:gap-10',
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
