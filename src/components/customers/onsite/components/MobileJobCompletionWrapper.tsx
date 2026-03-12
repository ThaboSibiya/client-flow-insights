import React from 'react';
import {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileJobCompletionWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Responsive wrapper: renders a bottom Drawer on mobile (thumb-friendly)
 * and a right-side Sheet on desktop for the Job Completion flow.
 */
export const MobileJobCompletionWrapper = ({
  isOpen,
  onClose,
  children,
}: MobileJobCompletionWrapperProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[92vh] flex flex-col">
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        {children}
      </SheetContent>
    </Sheet>
  );
};
