import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import PipelineStageColumn from './PipelineStageColumn';
import { Customer, CustomerTicket } from '@/types/customer';
import { PipelineType, PipelineStage, UsePipelineReturn } from '@/hooks/usePipeline';

interface PipelineKanbanProps {
  pipeline: UsePipelineReturn;
  onStageEdit: (stageId: string) => void;
  onStageDelete: (stageId: string) => void;
  onSetTarget: (stageId: string) => void;
  onSetAutomation: (stageId: string) => void;
}

const PipelineKanban = ({
  pipeline,
  onStageEdit,
  onStageDelete,
  onSetTarget,
  onSetAutomation,
}: PipelineKanbanProps) => {
  const {
    type,
    filteredStages,
    activeItem,
    selectedItem,
    setSelectedItem,
    handleDragStart,
    handleDragEnd,
    handleItemMove,
    handleAddItem,
  } = pipeline;

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={filteredStages.map(s => s.id)}>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {filteredStages.map((stage) => (
            <PipelineStageColumn
              key={stage.id}
              stage={stage}
              type={type}
              allStages={filteredStages}
              selectedItem={selectedItem}
              onItemSelect={setSelectedItem}
              onItemMove={handleItemMove}
              onStageEdit={onStageEdit}
              onStageDelete={onStageDelete}
              onAddItem={handleAddItem}
              onSetTarget={onSetTarget}
              onSetAutomation={onSetAutomation}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem ? (
          <div className="bg-background p-3 rounded-lg shadow-xl border opacity-95 rotate-2 scale-105 max-w-[280px]">
            {type === 'customer' ? (
              <>
                <p className="font-medium truncate">{(activeItem as Customer).name}</p>
                <p className="text-sm text-muted-foreground truncate">{(activeItem as Customer).email}</p>
              </>
            ) : (
              <>
                <p className="font-medium truncate">{(activeItem as CustomerTicket).subject}</p>
                <p className="text-sm text-muted-foreground">#{(activeItem as CustomerTicket).ticketNumber}</p>
              </>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default PipelineKanban;
