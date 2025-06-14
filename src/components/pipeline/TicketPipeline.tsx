import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
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
      color: '#f59e0b',
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
          <h2 className="text-2xl font-bold">Ticket Pipeline</h2>
          <p className="text-muted-foreground">Manage ticket workflow and progression</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Pipeline Settings
          </Button>
          <Button onClick={() => setIsAddStageOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Stage
          </Button>
        </div>
      </div>

      <PipelineMetrics type="ticket" stages={stages} />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stages.map(s => s.id)}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <EnhancedPipelineStage
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
