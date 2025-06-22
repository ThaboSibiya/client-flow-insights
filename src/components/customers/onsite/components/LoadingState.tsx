
import React from 'react';

export const LoadingState = () => {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">Loading customers...</p>
    </div>
  );
};
