import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface LocationCaptureProps {
  location: { lat: number; lng: number } | null;
  onRetry: () => void;
}

export const LocationCapture = ({ location, onRetry }: LocationCaptureProps) => {
  return (
    <div className="flex items-center justify-between p-3 sm:p-3 rounded-lg bg-muted/30 border border-border min-h-[56px]">
      <div className="flex items-center gap-2.5">
        {location ? (
          <>
            <div className="h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 sm:h-4 sm:w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Location verified</p>
              <p className="text-xs text-muted-foreground">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <XCircle className="h-5 w-5 sm:h-4 sm:w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Location not captured</p>
              <p className="text-xs text-muted-foreground">Tap retry to capture GPS</p>
            </div>
          </>
        )}
      </div>
      {!location && (
        <Button variant="ghost" onClick={onRetry} className="gap-1.5 text-sm h-10 touch-target">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
};
