import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

const PANEL_WIDTH_KEY = 'pipeline.detailPanelWidth';
const DEFAULT_PANEL_WIDTH = 420;
const MIN_PANEL_WIDTH = 340;
const MAX_PANEL_WIDTH = 720;

const PipelineLayout = () => {
  const pipeline = usePipeline('customer');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [targetStageId, setTargetStageId] = useState<string | null>(null);
  const [automationStageId, setAutomationStageId] = useState<string | null>(null);

  // Persisted panel width
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_PANEL_WIDTH;
    try {
      const stored = Number(localStorage.getItem(PANEL_WIDTH_KEY));
      if (stored >= MIN_PANEL_WIDTH && stored <= MAX_PANEL_WIDTH) return stored;
    } catch {
      // ignore
    }
    return DEFAULT_PANEL_WIDTH;
  });
  const resizingRef = useRef(false);

  const persistWidth = useCallback((w: number) => {
    try {
      localStorage.setItem(PANEL_WIDTH_KEY, String(w));
    } catch {
      // ignore
    }
  }, []);

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      resizingRef.current = true;
      const startX = e.clientX;
      const startWidth = panelWidth;

      const onMove = (ev: PointerEvent) => {
        if (!resizingRef.current) return;
        const delta = startX - ev.clientX;
        const next = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, startWidth + delta));
        setPanelWidth(next);
      };
      const onUp = () => {
        resizingRef.current = false;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        setPanelWidth((w) => {
          persistWidth(w);
          return w;
        });
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [panelWidth, persistWidth]
  );

  const editingStage = editingStageId ? pipeline.stages.find((s) => s.id === editingStageId) : null;
  const targetStage = targetStageId ? pipeline.stages.find((s) => s.id === targetStageId) : null;
  const automationStage = automationStageId
    ? pipeline.stages.find((s) => s.id === automationStageId)
    : null;

  // Flattened items for j/k navigation
  const flatItems = useMemo(
    () => pipeline.stages.flatMap((s: any) => s.items as any[]),
    [pipeline.stages]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const isEditableTarget = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (node as any).isContentEditable
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K - Toggle search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }
      // ESC - Close search or detail panel
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        else if (pipeline.selectedItem) pipeline.setSelectedItem(null);
        return;
      }
      // ⌘N - Add new stage
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        pipeline.setIsAddStageOpen(true);
        return;
      }

      // j / k navigation – only when panel is open and not typing
      if ((e.key === 'j' || e.key === 'k') && pipeline.selectedItem && !isEditableTarget(e.target)) {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (flatItems.length === 0) return;
        e.preventDefault();
        const currentIndex = flatItems.findIndex((i) => i.id === (pipeline.selectedItem as any).id);
        const delta = e.key === 'j' ? 1 : -1;
        const nextIndex =
          currentIndex === -1
            ? 0
            : (currentIndex + delta + flatItems.length) % flatItems.length;
        pipeline.setSelectedItem(flatItems[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, pipeline, flatItems]);

  const handleStageEdit = useCallback((stageId: string) => setEditingStageId(stageId), []);
  const handleStageDelete = useCallback(
    (stageId: string) => pipeline.handleStageDelete(stageId),
    [pipeline]
  );
  const handleSetTarget = useCallback((stageId: string) => setTargetStageId(stageId), []);
  const handleSetAutomation = useCallback((stageId: string) => setAutomationStageId(stageId), []);

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

      {/* Detail slide-over (overlay; resizable on desktop) */}
      <Sheet
        open={!!pipeline.selectedItem}
        onOpenChange={(open) => !open && pipeline.setSelectedItem(null)}
      >
        <SheetContent
          side="right"
          className="p-0 flex flex-col max-w-[95vw]"
          style={isMobile ? undefined : { width: `${panelWidth}px`, maxWidth: '95vw' }}
        >
          {!isMobile && (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panel"
              onPointerDown={handleResizeStart}
              className="absolute left-0 top-0 h-full w-1.5 -translate-x-1/2 cursor-col-resize z-20 hover:bg-primary/30 active:bg-primary/50 transition-colors"
            />
          )}
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
      <PipelineSettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
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
