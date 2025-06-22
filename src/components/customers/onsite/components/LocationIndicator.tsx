
import React from 'react';
import { MapPin } from "lucide-react";

interface LocationIndicatorProps {
  hasLocation: boolean;
}

export const LocationIndicator = ({ hasLocation }: LocationIndicatorProps) => {
  if (!hasLocation) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
      <MapPin className="h-4 w-4" />
      <span>Location captured successfully</span>
    </div>
  );
};
