import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/use-haptic';

interface StickyMobileSaveBarProps {
  onSave: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  isSaving?: boolean;
  disabled?: boolean;
  className?: string;
  /** Float above the bottom navigation (5rem) so it never collides with `MobileNavigation`. */
  aboveBottomNav?: boolean;
}

/** Sticky save/cancel bar for mobile forms. Safe-area aware, ≥44px touch targets. */
const StickyMobileSaveBar: React.FC<StickyMobileSaveBarProps> = ({
  onSave,
  onCancel,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  isSaving = false,
  disabled = false,
  className,
  aboveBottomNav = true,
}) => {
  const { impact } = useHaptic();

  const handleSave = () => {
    impact('medium');
    onSave();
  };

  return (
    <div
      className={cn(
        'fixed inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg px-4 py-3 flex gap-2',
        className
      )}
      style={{
        bottom: 0,
        paddingBottom: aboveBottomNav
          ? `calc(env(safe-area-inset-bottom, 0px) + 5rem + 0.75rem)`
          : `calc(env(safe-area-inset-bottom, 0px) + 0.75rem)`,
      }}
    >
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          className="flex-1 min-h-11"
          onClick={onCancel}
          disabled={isSaving}
        >
          {cancelLabel}
        </Button>
      )}
      <Button
        type="button"
        className="flex-1 min-h-11"
        onClick={handleSave}
        disabled={disabled || isSaving}
      >
        {isSaving ? 'Saving…' : saveLabel}
      </Button>
    </div>
  );
};

export default StickyMobileSaveBar;
