
import { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { arrayMove } from '@dnd-kit/sortable';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';

export interface TicketStage {
  id: string;
  name: string;
  color: string;
  tickets: any[];
  automationEnabled: boolean;
  target?: number;
}

export const useTicketPipeline = () => {
  const { customers } = useCRM();
  const allTickets = customers.flatMap(c => c.activeTickets || []);

  const [stages, setStages] = useState<TicketStage[]>([
    {
      id: 'open',
      name: 'New Tickets',
      color: '#DC2626',
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
      color: '#374151',
      tickets: [],
      automationEnabled: false,
      target: 5
    },
    {
      id: 'resolved',
      name: 'Resolved',
      color: '#059669',
      tickets: allTickets.filter(t => t.status === 'resolved'),
      automationEnabled: false,
      target: 10
    },
    {
      id: 'closed',
      name: 'Closed',
      color: '#1F2937',
      tickets: allTickets.filter(t => t.status === 'closed'),
      automationEnabled: false
    }
  ]);

  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<any | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (active.id.toString().startsWith('ticket-')) {
      const ticketId = active.id.toString().replace('ticket-', '');
      const ticket = stages
        .flatMap(stage => stage.tickets || [])
        .find(t => t.id === ticketId);
      setActiveItem(ticket);
    } else {
      setActiveItem(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    if (active.id.toString().startsWith('ticket-')) {
      const ticketId = active.id.toString().replace('ticket-', '');
      const targetStageId = over.id.toString();

      const sourceStage = stages.find(stage => 
        (stage.tickets || []).some(t => t.id === ticketId)
      );

      if (sourceStage && sourceStage.id !== targetStageId) {
        handleTicketMove(ticketId, sourceStage.id, targetStageId);
      }
      return;
    }

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
  
  return {
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
  };
};
