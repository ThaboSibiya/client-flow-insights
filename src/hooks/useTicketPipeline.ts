
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { arrayMove } from '@dnd-kit/sortable';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { ticketEventBus, TICKET_EVENTS } from '@/stores/ticketEventBus';
import { 
  TicketPipelineStage, 
  TicketPipelineItem, 
  TicketPipelineHookReturn 
} from '@/types/pipeline';

export const useTicketPipeline = (): TicketPipelineHookReturn => {
  const { customers, updateTicketStatus } = useCRM();
  const allTickets = customers.flatMap(c => c.activeTickets || []);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [stages, setStages] = useState<TicketPipelineStage[]>([
    {
      id: 'open',
      name: 'New Tickets',
      color: '#DC2626',
      tickets: [],
      automationEnabled: false,
      target: 20
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      color: '#6B7280',
      tickets: [],
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
      tickets: [],
      automationEnabled: false,
      target: 10
    },
    {
      id: 'closed',
      name: 'Closed',
      color: '#1F2937',
      tickets: [],
      automationEnabled: false
    }
  ]);

  // Sync tickets with stages whenever allTickets changes
  useEffect(() => {
    setStages(prevStages => prevStages.map(stage => {
      let stageTickets;
      
      if (stage.id === 'open') {
        stageTickets = allTickets.filter(t => t.status === 'open');
      } else if (stage.id === 'in-progress') {
        stageTickets = allTickets.filter(t => t.status === 'in-progress');
      } else if (stage.id === 'resolved') {
        stageTickets = allTickets.filter(t => t.status === 'resolved');
      } else if (stage.id === 'closed') {
        stageTickets = allTickets.filter(t => t.status === 'closed');
      } else {
        // For 'review' or custom stages
        stageTickets = stage.tickets;
      }
      
      return { ...stage, tickets: stageTickets };
    }));
  }, [allTickets, refreshTrigger]);

  const [isAddStageOpen, setIsAddStageOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<TicketPipelineItem | null>(null);

  // Listen for ticket events to refresh pipeline
  useEffect(() => {
    const unsubscribe = ticketEventBus.on(TICKET_EVENTS.PIPELINE_REFRESH, () => {
      setRefreshTrigger(prev => prev + 1);
    });

    return unsubscribe;
  }, []);

  const handleTicketMove = useCallback(async (ticketId: string, fromStageId: string, toStageId: string) => {
    // Early return if moving to same stage
    if (fromStageId === toStageId) return;

    // Update local state immediately for responsive UI
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

    // Map stage IDs to ticket status
    const statusMap: Record<string, any> = {
      'open': 'open',
      'in-progress': 'in-progress',
      'review': 'in-progress',
      'resolved': 'resolved',
      'closed': 'closed'
    };

    const newStatus = statusMap[toStageId];
    if (newStatus) {
      // Save to Supabase
      await updateTicketStatus(ticketId, newStatus);
      
      // Emit ticket moved to stage event
      ticketEventBus.emit(TICKET_EVENTS.TICKET_MOVED_TO_STAGE, { 
        ticketId, 
        fromStageId, 
        toStageId,
        newStatus
      });
    }
  }, [updateTicketStatus]);


  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    
    if (active.id.toString().startsWith('ticket-')) {
      const ticketId = active.id.toString().replace('ticket-', '');
      // Search through allTickets array directly instead of stages
      const ticket = allTickets.find(t => t.id === ticketId);
      setActiveItem(ticket || null);
    } else {
      setActiveItem(null);
    }
  }, [allTickets]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    if (active.id.toString().startsWith('ticket-')) {
      const ticketId = active.id.toString().replace('ticket-', '');
      const targetStageId = over.id.toString();

      // Find source stage from allTickets array
      const ticket = allTickets.find(t => t.id === ticketId);
      if (!ticket) return;

      const statusToStageMap: Record<string, string> = {
        'open': 'open',
        'in-progress': 'in-progress',
        'resolved': 'resolved',
        'closed': 'closed'
      };
      
      const sourceStageId = statusToStageMap[ticket.status || 'open'];

      if (sourceStageId !== targetStageId) {
        handleTicketMove(ticketId, sourceStageId, targetStageId);
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
  }, [allTickets, handleTicketMove]);

  const addStage = (stageName: string, color: string): void => {
    const newStage: TicketPipelineStage = {
      id: `stage-${Date.now()}`,
      name: stageName,
      color,
      tickets: [],
      automationEnabled: false
    };
    setStages(prev => [...prev, newStage]);
    setIsAddStageOpen(false);
  };

  const handleStageEdit = (stageId: string, name: string, color: string) => {
    console.log('Ticket pipeline handleStageEdit called:', stageId, name, color);
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, name, color }
        : stage
    ));
  };

  const handleStageDelete = (stageId: string) => {
    console.log('Ticket pipeline handleStageDelete called:', stageId);
    setStages(prev => prev.filter(stage => stage.id !== stageId));
  };

  const handleAddTicket = (stageId: string) => {
    console.log('Add ticket to stage:', stageId);
  };

  const handleSetTarget = (stageId: string, target: number | undefined) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, target }
        : stage
    ));
  };

  const handleSetAutomation = (stageId: string, automationEnabled: boolean) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, automationEnabled }
        : stage
    ));
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
    handleSetTarget,
    handleSetAutomation
  };
};
