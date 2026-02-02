import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Plus, Settings, Loader2 } from "lucide-react";
import AddStageDialog from './AddStageDialog';
import EnhancedPipelineMetrics from './EnhancedPipelineMetrics';
import { useCustomerPipeline } from '@/hooks/useCustomerPipeline';
import DroppableStage from './DroppableStage';
import { useNavigate, useLocation } from 'react-router-dom';

const CustomerPipeline = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handlePipelineSettingsClick = () => {
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
    handleCustomerMove,
    addStage,
    handleStageEdit,
    handleStageDelete,
    handleAddCustomer,
    handleSetTarget,
    handleSetAutomation,
  } = useCustomerPipeline();

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Customer Pipeline</h2>
          <p className="text-muted-foreground">Drag customers between stages to update their status</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handlePipelineSettingsClick}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button 
            onClick={() => setIsAddStageOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Stage
          </Button>
        </div>
      </div>

      <EnhancedPipelineMetrics type="customer" stages={stages} />

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={stages.map(s => s.id)}>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {stages.map((stage) => (
              <DroppableStage
                key={stage.id}
                stage={stage}
                onCustomerMove={handleCustomerMove}
                onStageEdit={handleStageEdit}
                onStageDelete={handleStageDelete}
                onAddItem={handleAddCustomer}
                onSetTarget={handleSetTarget}
                onSetAutomation={handleSetAutomation}
                type="customer"
              />
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeItem ? (
            <div className="bg-background p-3 rounded-lg shadow-xl border opacity-95 rotate-2 scale-105">
              <p className="font-medium">{activeItem.name}</p>
              <p className="text-sm text-muted-foreground">{activeItem.email}</p>
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

export default CustomerPipeline;
