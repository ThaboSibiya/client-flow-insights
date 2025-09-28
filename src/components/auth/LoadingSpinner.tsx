
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-broker-primary/5 to-broker-accent/5">
      <div className="flex flex-col items-center justify-center">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-b-4 border-t-4 border-broker-primary`}></div>
        <p className="mt-4 text-lg font-medium text-broker-primary">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
