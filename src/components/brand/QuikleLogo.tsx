import React from 'react';
import { cn } from '@/lib/utils';

interface QuikleLogoProps {
  /** 'sm' = mobile/collapsed, 'md' = default sidebar, 'lg' = splash/hero */
  size?: 'sm' | 'md' | 'lg';
  /** Hide the text wordmark (icon only) */
  iconOnly?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { icon: 'h-8 w-8', text: 'text-lg', sub: 'text-[9px]', gap: 'gap-2', ring: 'p-1' },
  md: { icon: 'h-9 w-9', text: 'text-xl', sub: 'text-[10px]', gap: 'gap-2.5', ring: 'p-1.5' },
  lg: { icon: 'h-12 w-12', text: 'text-2xl', sub: 'text-[11px]', gap: 'gap-3', ring: 'p-2' },
};

const QuikleLogo: React.FC<QuikleLogoProps> = ({ size = 'md', iconOnly = false, className }) => {
  const cfg = sizeConfig[size];

  return (
    <div className={cn('flex items-center', cfg.gap, className)}>
      {/* Icon mark with branded ring */}
      <div className={cn(
        'relative flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20',
        cfg.ring
      )}>
        <img
          src="/lovable-uploads/f0901f42-4619-41c2-b222-e562191d61a9.png"
          alt="Quikle Logo"
          className={cn(cfg.icon, 'relative z-10 drop-shadow-sm')}
        />
        {/* Subtle glow behind icon */}
        <div className="absolute inset-0 rounded-xl bg-primary/10 blur-md -z-10" />
      </div>

      {/* Wordmark */}
      {!iconOnly && (
        <div className="flex flex-col min-w-0">
          <h1 className={cn(
            cfg.text,
            'font-extrabold tracking-tight leading-none bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'
          )}>
            QUIKLE
          </h1>
          <p className={cn(
            cfg.sub,
            'font-semibold text-muted-foreground/60 tracking-[0.18em] uppercase leading-none mt-0.5'
          )}>
            Innovation Suite
          </p>
        </div>
      )}
    </div>
  );
};

export default QuikleLogo;
