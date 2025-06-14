import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import EnhancedPipelineStage from './EnhancedPipelineStage';
import AddStageDialog from './AddStageDialog';
import PipelineMetrics from './PipelineMetrics';
import { useCRM } from '@/context/CRMContext';

interface TicketStage {
  id: string;
  name: string;
  color: string;
  tickets: any[];
  automationEnabled: boolean;
  target?: number;
}

const TicketPipeline = () => {
  const { customers } = useCRM();
  const allTickets = customers.flatMap(c => c.activeTickets || []);

  const [stages, setStages] = useState<TicketStage[]>([
    {
      id: 'open',
      name: 'New Tickets',
      color: '#ef4444',
      tickets: allTickets.filter(t => t.status === 'open'),
      automationEnabled: false,
      target: 20
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      color: '#6B7280',
      tickets: allTickets.filter(t => t.status === 'in-progress'),
      automationEnabled: false,
      target: 15
    },
    {
      id: 'review',
      name: 'Under Review',
      color: '#8b5cf6',
      tickets: [],
      automationEnabled: false,
      target: 5
    },
    {
      id: 'resolved',
      name: 'Resolved',
      color: '#10b981',
      tickets: allTickets.filter(t => t.status === 'resolved'),
      automationEnabled: false,
      target: 10
    },
    {
      id: 'closed',
      name: 'Closed',
      color: '#6b7280',
      tickets: allTickets.filter(t => t.status === 'closed'),
      automationEnabled: false
    }
  ]);

  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    
    // Check if dragging a ticket card
    if (active.id.toString().startsWith('ticket-')) {
      const ticketId = active.id.toString().replace('ticket-', '');
      const ticket = stages
        .flatMap(stage => stage.tickets || [])
        .find(t => t.id === ticketId);
      setActiveItem(ticket);
    }
    // Check if dragging a stage
    else {
      setActiveItem(null);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    // Handle ticket card drops
    if (active.id.toString().startsWith('ticket-')) {
      const ticketId = active.id.toString().replace('ticket-', '');
      const targetStageId = over.id;

      // Find source stage
      const sourceStage = stages.find(stage => 
        (stage.tickets || []).some(t => t.id === ticketId)
      );

      if (sourceStage && sourceStage.id !== targetStageId) {
        handleTicketMove(ticketId, sourceStage.id, targetStageId);
      }
      return;
    }

    // Handle stage reordering
    if (active.id !== over.id && !active.id.toString().startsWith('ticket-')) {
      setStages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleTicketMove = (ticketId: string, fromStageId: string, toStageId: string) => {
    setStages(prevStages => {
      const newStages = [...prevStages];
      const fromStage = newStages.find(s => s.id === fromStageId);
      const toStage = newStages.find(s => s.id === toStageId);
      
      if (fromStage && toStage) {
        const ticket = fromStage.tickets.find(t => t.id === ticketId);
        if (ticket) {
          fromStage.tickets = fromStage.tickets.filter(t => t.id !== ticketId);
          toStage.tickets.push(ticket);
        }
      }
      
      return newStages;
    });
  };

  const addStage = (stageName: string, color: string) => {
    const newStage: TicketStage = {
      id: `stage-${Date.now()}`,
      name: stageName,
      color,
      tickets: [],
      automationEnabled: false
    };
    setStages(prev => [...prev, newStage]);
    setIsAddStageOpen(false);
  };

  const handleStageEdit = (stageId: string) => {
    console.log('Edit stage:', stageId);
  };

  const handleStageDelete = (stageId: string) => {
    setStages(prev => prev.filter(stage => stage.id !== stageId));
  };

  const handleAddTicket = (stageId: string) => {
    console.log('Add ticket to stage:', stageId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-quikle-charcoal">Ticket Pipeline</h2>
          <p className="text-quikle-slate">Drag tickets between stages to update their status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2 border-quikle-silver/50 text-quikle-charcoal hover:bg-quikle-crystal">
            <Settings className="h-4 w-4" />
            Pipeline Settings
          </Button>
          <Button onClick={() => setIsAddStageOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white">
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

// New droppable stage component for tickets
const DroppableStage = ({ stage, onCustomerMove, onStageEdit, onStageDelete, onAddItem, type }) => {
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

export default TicketPipeline;
