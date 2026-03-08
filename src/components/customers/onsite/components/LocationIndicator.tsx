import React from 'react';
import { MapPin } from "lucide-react";

interface LocationIndicatorProps {
  hasLocation: boolean;
}

export const LocationIndicator = ({ hasLocation }: LocationIndicatorProps) => {
  if (!hasLocation) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <MapPin className="h-3.5 w-3.5 text-primary" />
      <span>Location captured</span>
    </div>
  );
};
