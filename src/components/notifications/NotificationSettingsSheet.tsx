import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import NotificationPreferencesPanel from './NotificationPreferences';

interface NotificationSettingsSheetProps {
  trigger?: React.ReactNode;
}

const NotificationSettingsSheet: React.FC<NotificationSettingsSheetProps> = ({ trigger }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Notification Settings</SheetTitle>
        </SheetHeader>
        <NotificationPreferencesPanel />
      </SheetContent>
    </Sheet>
  );
};

export default NotificationSettingsSheet;
