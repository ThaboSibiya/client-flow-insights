import React from 'react';

export const LoadingState = () => {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
      <p className="mt-2 text-sm text-muted-foreground">Loading customers...</p>
    </div>
  );
};
