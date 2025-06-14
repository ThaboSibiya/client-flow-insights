
import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PipelineStage from './PipelineStage';
import AddStageDialog from './AddStageDialog';
import { useCRM } from '@/context/CRMContext';

interface TicketStage {
  id: string;
  name: string;
  color: string;
  tickets: any[];
  automationEnabled: boolean;
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
      automationEnabled: false
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      color: '#f59e0b',
      tickets: allTickets.filter(t => t.status === 'in-progress'),
      automationEnabled: false
    },
    {
      id: 'review',
      name: 'Under Review',
      color: '#8b5cf6',
      tickets: [],
      automationEnabled: false
    },
    {
      id: 'resolved',
      name: 'Resolved',
      color: '#10b981',
      tickets: allTickets.filter(t => t.status === 'resolved'),
      automationEnabled: false
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ticket Pipeline</h2>
          <p className="text-muted-foreground">Manage ticket workflow and progression</p>
        </div>
        <Button onClick={() => setIsAddStageOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Stage
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stages.map(s => s.id)}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <PipelineStage
                key={stage.id}
                stage={stage}
                onCustomerMove={handleTicketMove}
                type="ticket"
              />
            ))}
          </div>
        </SortableContext>
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
