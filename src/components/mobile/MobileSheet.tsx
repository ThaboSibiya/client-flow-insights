import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
  snapPoints?: number[];
}

const MobileSheet: React.FC<MobileSheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  className,
  snapPoints,
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} snapPoints={snapPoints}>
      <DrawerContent className={cn('max-h-[85vh]', className)}>
        {(title || showCloseButton) && (
          <DrawerHeader className="relative">
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && <DrawerDescription>{description}</DrawerDescription>}
            {showCloseButton && (
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            )}
          </DrawerHeader>
        )}
        
        <div className="flex-1 overflow-y-auto px-4">
          {children}
        </div>
        
        {footer && (
          <DrawerFooter>
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default MobileSheet;
