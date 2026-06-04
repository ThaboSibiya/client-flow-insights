import React, { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import PipelineHeader from './PipelineHeader';
import PipelineKanban from './PipelineKanban';
import PipelineDetailPanel from './PipelineDetailPanel';
import PipelineSettingsModal from './PipelineSettingsModal';
import AddStageDialog from '../AddStageDialog';
import EditStageDialog from '../dialogs/EditStageDialog';
import SetTargetDialog from '../dialogs/SetTargetDialog';
import SetAutomationDialog from '../dialogs/SetAutomationDialog';
import { usePipeline } from '@/hooks/usePipeline';
import { useMediaQuery } from '@/hooks/use-media-query';

const PipelineLayout = () => {
  const pipeline = usePipeline('customer');
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [targetStageId, setTargetStageId] = useState<string | null>(null);
  const [automationStageId, setAutomationStageId] = useState<string | null>(null);

  const editingStage = editingStageId 
    ? pipeline.stages.find(s => s.id === editingStageId) 
    : null;
  const targetStage = targetStageId 
    ? pipeline.stages.find(s => s.id === targetStageId) 
    : null;
  const automationStage = automationStageId 
    ? pipeline.stages.find(s => s.id === automationStageId) 
    : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K - Toggle search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      // ESC - Close search or detail panel
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (pipeline.selectedItem) {
          pipeline.setSelectedItem(null);
        }
      }
      // ⌘N - Add new stage
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        pipeline.setIsAddStageOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, pipeline]);

  const handleStageEdit = useCallback((stageId: string) => {
    setEditingStageId(stageId);
  }, []);

  const handleStageDelete = useCallback((stageId: string) => {
    pipeline.handleStageDelete(stageId);
  }, [pipeline]);

  const handleSetTarget = useCallback((stageId: string) => {
    setTargetStageId(stageId);
  }, []);

  const handleSetAutomation = useCallback((stageId: string) => {
    setAutomationStageId(stageId);
  }, []);

  // Mobile layout - full width with slide-over detail
  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        <PipelineHeader
          type={pipeline.type}
          onTypeChange={pipeline.setType}
          searchQuery={pipeline.searchQuery}
          onSearchChange={pipeline.setSearchQuery}
          onAddStage={() => pipeline.setIsAddStageOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          totalItems={pipeline.totalItems}
          completedItems={pipeline.completedItems}
          conversionRate={pipeline.conversionRate}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
        />

        <div className="flex-1 overflow-hidden mt-4">
          <PipelineKanban
            pipeline={pipeline}
            onStageEdit={handleStageEdit}
            onStageDelete={handleStageDelete}
            onSetTarget={handleSetTarget}
            onSetAutomation={handleSetAutomation}
          />
        </div>

        {/* Mobile detail slide-over */}
        <Sheet
          open={!!pipeline.selectedItem}
          onOpenChange={(open) => !open && pipeline.setSelectedItem(null)}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-md p-0 flex flex-col"
          >
            {pipeline.selectedItem && (
              <PipelineDetailPanel
                item={pipeline.selectedItem}
                type={pipeline.type}
                onClose={() => pipeline.setSelectedItem(null)}
              />
            )}
          </SheetContent>
        </Sheet>

        {/* Dialogs */}
        <AddStageDialog
          open={pipeline.isAddStageOpen}
          onOpenChange={pipeline.setIsAddStageOpen}
          onAddStage={pipeline.addStage}
        />
        <PipelineSettingsModal
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
        />
        {editingStage && (
          <EditStageDialog
            open={!!editingStageId}
            onOpenChange={(open) => !open && setEditingStageId(null)}
            stage={editingStage}
            onEditStage={pipeline.handleStageEdit}
          />
        )}
        {targetStage && (
          <SetTargetDialog
            open={!!targetStageId}
            onOpenChange={(open) => !open && setTargetStageId(null)}
            stage={targetStage}
            onSetTarget={pipeline.handleSetTarget}
          />
        )}
        {automationStage && (
          <SetAutomationDialog
            open={!!automationStageId}
            onOpenChange={(open) => !open && setAutomationStageId(null)}
            stage={automationStage}
            onSetAutomation={pipeline.handleSetAutomation}
          />
        )}
      </div>
    );
  }

  // Desktop layout - split pane
  return (
    <div className="h-full flex flex-col">
      <PipelineHeader
        type={pipeline.type}
        onTypeChange={pipeline.setType}
        searchQuery={pipeline.searchQuery}
        onSearchChange={pipeline.setSearchQuery}
        onAddStage={() => pipeline.setIsAddStageOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalItems={pipeline.totalItems}
        completedItems={pipeline.completedItems}
        conversionRate={pipeline.conversionRate}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />

      <div className="flex-1 overflow-hidden mt-4">
        <PipelineKanban
          pipeline={pipeline}
          onStageEdit={handleStageEdit}
          onStageDelete={handleStageDelete}
          onSetTarget={handleSetTarget}
          onSetAutomation={handleSetAutomation}
        />
      </div>

      {/* Desktop detail slide-over (overlay, does not shrink kanban) */}
      <Sheet
        open={!!pipeline.selectedItem}
        onOpenChange={(open) => !open && pipeline.setSelectedItem(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-sm p-0 flex flex-col"
        >
          {pipeline.selectedItem && (
            <PipelineDetailPanel
              item={pipeline.selectedItem}
              type={pipeline.type}
              onClose={() => pipeline.setSelectedItem(null)}
            />
          )}
        </SheetContent>
      </Sheet>


      {/* Dialogs */}
      <AddStageDialog
        open={pipeline.isAddStageOpen}
        onOpenChange={pipeline.setIsAddStageOpen}
        onAddStage={pipeline.addStage}
      />
      <PipelineSettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
      {editingStage && (
        <EditStageDialog
          open={!!editingStageId}
          onOpenChange={(open) => !open && setEditingStageId(null)}
          stage={editingStage}
          onEditStage={pipeline.handleStageEdit}
        />
      )}
      {targetStage && (
        <SetTargetDialog
          open={!!targetStageId}
          onOpenChange={(open) => !open && setTargetStageId(null)}
          stage={targetStage}
          onSetTarget={pipeline.handleSetTarget}
        />
      )}
      {automationStage && (
        <SetAutomationDialog
          open={!!automationStageId}
          onOpenChange={(open) => !open && setAutomationStageId(null)}
          stage={automationStage}
          onSetAutomation={pipeline.handleSetAutomation}
        />
      )}
    </div>
  );
};

export default PipelineLayout;
