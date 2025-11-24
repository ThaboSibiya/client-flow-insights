
import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import AddStageDialog from './AddStageDialog';
import PipelineMetrics from './PipelineMetrics';
import { useTicketPipeline } from '@/hooks/useTicketPipeline';
import DroppableStage from './DroppableStage';
import { useNavigate, useLocation } from 'react-router-dom';

const TicketPipeline = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handlePipelineSettingsClick = () => {
    // Navigate to settings tab on the pipeline page
    const currentPath = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', 'settings');
    navigate(`${currentPath}?${searchParams.toString()}`, { replace: true });
  };

  const {
    stages,
    isAddStageOpen,
    setIsAddStageOpen,
    activeItem,
    handleDragStart,
    handleDragEnd,
    handleTicketMove,
    addStage,
    handleStageEdit,
    handleStageDelete,
    handleAddTicket,
    handleSetTarget,
    handleSetAutomation,
  } = useTicketPipeline();

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-quikle-charcoal">Ticket Pipeline</h2>
          <p className="text-quikle-slate">Drag tickets between stages to update their status</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handlePipelineSettingsClick}
            className="flex items-center gap-2 border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal hover:border-quikle-slate"
          >
            <Settings className="h-4 w-4" />
            Pipeline Settings
          </Button>
          <Button 
            onClick={() => setIsAddStageOpen(true)} 
            className="flex items-center gap-2 bg-quikle-primary hover:bg-quikle-secondary text-white border-none"
          >
            <Plus className="h-4 w-4" />
            Add Stage
          </Button>
        </div>
      </div>

      <PipelineMetrics type="ticket" stages={stages} />

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={stages.map(s => s.id)}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <DroppableStage
                key={stage.id}
                stage={stage}
                onCustomerMove={handleTicketMove}
                onStageEdit={handleStageEdit}
                onStageDelete={handleStageDelete}
                onAddItem={handleAddTicket}
                onSetTarget={handleSetTarget}
                onSetAutomation={handleSetAutomation}
                type="ticket"
              />
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeItem ? (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-quikle-silver/30 opacity-90">
              <p className="font-medium text-quikle-charcoal">{activeItem.subject}</p>
              <p className="text-sm text-quikle-slate">#{activeItem.ticketNumber}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddStageDialog
        open={isAddStageOpen}
        onOpenChange={setIsAddStageOpen}
        onAddStage={addStage}
      />
    </div>
  );
};

export default TicketPipeline;
