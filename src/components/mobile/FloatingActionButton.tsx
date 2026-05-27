import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/use-haptic';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary';
  position?: 'bottom-right' | 'bottom-center';
  className?: string;
  extended?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon = <Plus className="h-6 w-6" />,
  label,
  variant = 'primary',
  position = 'bottom-right',
  className,
  extended = false,
}) => {
  const { impact } = useHaptic();

  const handleClick = () => {
    impact('medium');
    onClick();
  };

  return (
    <Button
      onClick={handleClick}
      style={{
        bottom: `calc(env(safe-area-inset-bottom, 0px) + 9.5rem)`,
      }}
      className={cn(
        'fixed z-40 shadow-lg transition-all duration-200 active:scale-95',
        // Size based on extended state
        extended ? 'h-14 px-6 rounded-full gap-2' : 'h-14 w-14 rounded-full p-0',
        // Position (horizontal only; vertical handled via inline style to stack above bottom nav + QuikleAgent FAB)
        position === 'bottom-right' && 'right-4',
        position === 'bottom-center' && 'left-1/2 -translate-x-1/2',
        // Variant — semantic tokens only
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-card border border-border text-foreground hover:bg-accent',
        className
      )}
    >
      {icon}
      {extended && label && (
        <span className="font-medium">{label}</span>
      )}
    </Button>
  );
};

export default FloatingActionButton;
