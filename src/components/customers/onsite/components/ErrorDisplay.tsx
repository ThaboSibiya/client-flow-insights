import React from 'react';
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span className="text-sm">{error}</span>
    </div>
  );
};
