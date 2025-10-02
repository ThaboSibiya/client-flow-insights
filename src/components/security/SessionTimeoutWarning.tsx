import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock } from 'lucide-react';

interface SessionTimeoutWarningProps {
  open: boolean;
  remainingSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  open,
  remainingSeconds,
  onExtend,
  onLogout
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning/10 rounded-full">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <AlertDialogTitle className="text-xl">Session Timeout Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 text-base">
            <p>
              Your session will expire in <span className="font-bold text-warning">{formatTime(remainingSeconds)}</span> due to inactivity.
            </p>
            <p className="text-sm text-muted-foreground">
              For your security, you'll be automatically logged out if you don't take action.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onLogout}>
            Log Out Now
          </AlertDialogCancel>
          <AlertDialogAction onClick={onExtend} className="bg-primary hover:bg-primary/90">
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionTimeoutWarning;
