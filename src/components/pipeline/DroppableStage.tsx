
import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import EnhancedPipelineStage from './EnhancedPipelineStage';
import { PipelineStageProps } from '@/types/pipeline';

const DroppableStage = memo(({ stage, onCustomerMove, onStageEdit, onStageDelete, onAddItem, onSetTarget, onSetAutomation, type }: PipelineStageProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div ref={setNodeRef} className={`transition-colors ${isOver ? 'bg-quikle-crystal rounded-lg' : ''}`}>
      <EnhancedPipelineStage
        stage={stage}
        onCustomerMove={onCustomerMove}
        onStageEdit={onStageEdit}
        onStageDelete={onStageDelete}
        onAddItem={onAddItem}
        onSetTarget={onSetTarget}
        onSetAutomation={onSetAutomation}
        type={type}
      />
    </div>
  );
});

DroppableStage.displayName = 'DroppableStage';

export default DroppableStage;
