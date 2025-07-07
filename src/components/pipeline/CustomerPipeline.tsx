
import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Plus, Settings, Smartphone, Monitor } from "lucide-react";
import AddStageDialog from './AddStageDialog';
import PipelineMetrics from './PipelineMetrics';
import PipelineAdvancedFilters from './PipelineAdvancedFilters';
import CustomStageBuilder from './CustomStageBuilder';
import { useCustomerPipeline } from '@/hooks/useCustomerPipeline';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { usePipelineFilters } from '@/hooks/usePipelineFilters';
import DroppableStage from './DroppableStage';
import MobilePipelineView from './MobilePipelineView';

const CustomerPipeline = () => {
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
  } = useCustomerPipeline();

  const { shouldUseMobileView } = useMobileDetection();
  const [forceMobileView, setForceMobileView] = React.useState(false);
  const [showStageBuilder, setShowStageBuilder] = React.useState(false);
  const [editingStage, setEditingStage] = React.useState(null);

  const useMobileView = shouldUseMobileView || forceMobileView;

  // Get all items for filtering
  const allItems = React.useMemo(() => {
    return stages.flatMap(stage => stage.customers || []);
  }, [stages]);

  const {
    searchQuery,
    setSearchQuery,
    selectedStageIds,
    setSelectedStageIds,
    selectedPriorities,
    setSelectedPriorities,
    selectedAssignees,
    setSelectedAssignees,
    dateRange,
    setDateRange,
    selectedStatuses,
    setSelectedStatuses,
    filteredStages,
    savedPresets,
    applyPreset,
    saveCurrentAsPreset,
    deletePreset,
    clearFilters,
    activeFiltersCount
  } = usePipelineFilters({
    stages,
    items: allItems,
    type: 'customer'
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleStageBuilderSave = (stage: any) => {
    // In a real implementation, this would save to backend
    console.log('Saving custom stage:', stage);
    setShowStageBuilder(false);
    setEditingStage(null);
  };

  const handleEditStage = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    setEditingStage(stage);
    setShowStageBuilder(true);
  };

  if (showStageBuilder) {
    return (
      <div className="space-y-6">
        <CustomStageBuilder
          stage={editingStage}
          onSave={handleStageBuilderSave}
          onCancel={() => {
            setShowStageBuilder(false);
            setEditingStage(null);
          }}
          type="customer"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-quikle-charcoal">Customer Pipeline</h2>
          <p className="text-quikle-slate">
            {useMobileView 
              ? 'Tap cards to move between stages' 
              : 'Drag customers between stages to update their status'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {/* View toggle for desktop */}
          <div className="hidden md:flex items-center gap-1 mr-2">
            <Button
              variant={!forceMobileView ? "default" : "outline"}
              size="sm"
              onClick={() => setForceMobileView(false)}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={forceMobileView ? "default" : "outline"}
              size="sm"
              onClick={() => setForceMobileView(true)}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowStageBuilder(true)}
            className="flex items-center gap-2 border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal hover:border-quikle-slate"
          >
            <Settings className="h-4 w-4" />
            Custom Stages
          </Button>
          <Button 
            onClick={() => setIsAddStageOpen(true)}
            className="bg-quikle-primary text-white hover:bg-quikle-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Stage
          </Button>
        </div>
      </div>

      <PipelineMetrics type="customer" stages={filteredStages} />

      <PipelineAdvancedFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStageIds={selectedStageIds}
        setSelectedStageIds={setSelectedStageIds}
        selectedPriorities={selectedPriorities}
        setSelectedPriorities={setSelectedPriorities}
        selectedAssignees={selectedAssignees}
        setSelectedAssignees={setSelectedAssignees}
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        stages={stages}
        savedPresets={savedPresets}
        applyPreset={applyPreset}
        saveCurrentAsPreset={saveCurrentAsPreset}
        deletePreset={deletePreset}
        clearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
        type="customer"
      />

      {useMobileView ? (
        <MobilePipelineView
          stages={filteredStages}
          onMove={handleCustomerMove}
          type="customer"
        />
      ) : (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={filteredStages.map(s => s.id)}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {filteredStages.map((stage) => (
                <DroppableStage
                  key={stage.id}
                  stage={stage}
                  onCustomerMove={handleCustomerMove}
                  onStageEdit={() => handleEditStage(stage.id)}
                  onStageDelete={handleStageDelete}
                  onAddItem={handleAddCustomer}
                  type="customer"
                />
              ))}
            </div>
          </SortableContext>
          
          <DragOverlay>
            {activeItem ? (
              <div className="bg-white p-3 rounded-lg shadow-lg border border-quikle-silver/30 opacity-90">
                <p className="font-medium text-quikle-charcoal">{activeItem.name}</p>
                <p className="text-sm text-quikle-slate">{activeItem.email}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <AddStageDialog
        open={isAddStageOpen}
        onOpenChange={setIsAddStageOpen}
        onAddStage={addStage}
      />
    </div>
  );
};

export default CustomerPipeline;
