import React from 'react';
import { PipelineLayout } from '@/components/pipeline/modern';
import PipelineErrorBoundary from '@/components/error/PipelineErrorBoundary';

const Pipeline: React.FC = () => {
  return (
    <PipelineErrorBoundary>
      <PipelineLayout />
    </PipelineErrorBoundary>
  );
};

export default Pipeline;
