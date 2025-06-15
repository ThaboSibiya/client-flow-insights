
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import EnhancedPipelineStage from './EnhancedPipelineStage';

const DroppableStage = ({ stage, onCustomerMove, onStageEdit, onStageDelete, onAddItem, type }: any) => {
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
        type={type}
      />
    </div>
  );
};

export default DroppableStage;
