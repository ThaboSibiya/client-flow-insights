
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-broker-primary/5 to-broker-accent/5">
      <div className="flex flex-col items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-broker-primary"></div>
        <p className="mt-4 text-lg font-medium text-broker-primary">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
