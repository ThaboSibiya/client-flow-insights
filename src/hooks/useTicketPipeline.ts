
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { arrayMove } from '@dnd-kit/sortable';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { ticketEventBus, TICKET_EVENTS } from '@/stores/ticketEventBus';
import { TicketStatus } from '@/types/customer';
import { 
  TicketPipelineStage, 
  TicketPipelineItem, 
  TicketPipelineHookReturn 
} from '@/types/pipeline';

export const useTicketPipeline = (): TicketPipelineHookReturn => {
  const { customers, updateTicketStatus } = useCRM();
  const allTickets = customers.flatMap(c => c.activeTickets || []);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  // Sync tickets with stages — skip during drag to preserve optimistic state
  useEffect(() => {
    if (isDragging) return;
    
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
        stageTickets = stage.tickets;
      }
      
      return { ...stage, tickets: stageTickets };
    }));
  }, [allTickets, refreshTrigger, isDragging]);

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
    if (fromStageId === toStageId) return;

    // Optimistic update with immutable state
    setStages(prevStages => {
      return prevStages.map(stage => {
        if (stage.id === fromStageId) {
          return { ...stage, tickets: stage.tickets.filter(t => t.id !== ticketId) };
        }
        if (stage.id === toStageId) {
          const ticket = prevStages
            .find(s => s.id === fromStageId)?.tickets
            .find(t => t.id === ticketId);
          if (ticket) {
            return { ...stage, tickets: [...stage.tickets, ticket] };
          }
        }
        return stage;
      });
    });

    const statusMap: Record<string, TicketStatus> = {
      'open': 'open' as TicketStatus,
      'in-progress': 'in-progress' as TicketStatus,
      'resolved': 'resolved' as TicketStatus,
      'closed': 'closed' as TicketStatus,
    };

    const newStatus = statusMap[toStageId];
    if (newStatus) {
      await updateTicketStatus(ticketId, newStatus);
      ticketEventBus.emit(TICKET_EVENTS.TICKET_MOVED_TO_STAGE, { 
        ticketId, fromStageId, toStageId, newStatus
      });
    }
  }, [updateTicketStatus]);


  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    
    setIsDragging(true);
    
    if (active.id.toString().startsWith('ticket-')) {
      const ticketId = active.id.toString().replace('ticket-', '');
      const ticket = allTickets.find(t => t.id === ticketId);
      setActiveItem(ticket || null);
    } else {
      setActiveItem(null);
    }
  }, [allTickets]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    setIsDragging(false);

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
