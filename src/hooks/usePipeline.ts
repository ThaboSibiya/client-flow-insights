import { useState, useCallback, useEffect, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { arrayMove } from '@dnd-kit/sortable';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { Customer, CustomerTicket, CustomerStatus, TicketStatus } from '@/types/customer';

export type PipelineType = 'customer' | 'ticket';

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  items: (Customer | CustomerTicket)[];
  automationEnabled: boolean;
  target?: number;
}

export interface UsePipelineReturn {
  stages: PipelineStage[];
  type: PipelineType;
  setType: (type: PipelineType) => void;
  activeItem: Customer | CustomerTicket | null;
  selectedItem: Customer | CustomerTicket | null;
  setSelectedItem: (item: Customer | CustomerTicket | null) => void;
  isAddStageOpen: boolean;
  setIsAddStageOpen: (open: boolean) => void;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleItemMove: (itemId: string, fromStageId: string, toStageId: string) => void;
  addStage: (stageName: string, color: string) => void;
  handleStageEdit: (stageId: string, name: string, color: string) => void;
  handleStageDelete: (stageId: string) => void;
  handleAddItem: (stageId: string) => void;
  handleSetTarget: (stageId: string, target: number | undefined) => void;
  handleSetAutomation: (stageId: string, enabled: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredStages: PipelineStage[];
  totalItems: number;
  completedItems: number;
  conversionRate: number;
}

const CUSTOMER_STAGES_CONFIG = [
  { id: 'new', name: 'New Leads', color: 'hsl(var(--muted-foreground))', statusMatch: 'new', target: 50 },
  { id: 'contacted', name: 'Contacted', color: 'hsl(var(--primary))', statusMatch: 'pending', target: 30 },
  { id: 'qualified', name: 'Qualified', color: 'hsl(var(--accent-foreground))', statusMatch: 'existing', target: 20 },
  { id: 'closed', name: 'Closed Won', color: 'hsl(142 76% 36%)', statusMatch: 'finalised', target: 10 },
];

const TICKET_STAGES_CONFIG = [
  { id: 'open', name: 'Open', color: 'hsl(var(--destructive))', statusMatch: 'open', target: 20 },
  { id: 'in-progress', name: 'In Progress', color: 'hsl(var(--primary))', statusMatch: 'in-progress', target: 15 },
  { id: 'pending', name: 'Pending', color: 'hsl(38 92% 50%)', statusMatch: 'pending', target: 10 },
  { id: 'resolved', name: 'Resolved', color: 'hsl(142 76% 36%)', statusMatch: 'resolved', target: 30 },
];

export const usePipeline = (initialType: PipelineType = 'customer'): UsePipelineReturn => {
  const { customers, updateCustomerStatus } = useCRM();
  const [type, setType] = useState<PipelineType>(initialType);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<Customer | CustomerTicket | null>(null);
  const [selectedItem, setSelectedItem] = useState<Customer | CustomerTicket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate mock tickets for demo
  const tickets = useMemo((): CustomerTicket[] => {
    return customers.slice(0, 8).map((customer, index) => ({
      id: `ticket-${customer.id}`,
      ticketNumber: `TKT-${1000 + index}`,
      subject: `Support request from ${customer.name}`,
      description: 'Sample ticket description',
      priority: (['low', 'medium', 'high', 'urgent'] as const)[index % 4],
      status: (['open', 'in-progress', 'closed', 'resolved'] as const)[index % 4] as TicketStatus,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      assignedTo: index % 2 === 0 ? { id: 'emp-1', name: 'John Smith', email: 'john@example.com', role: 'Support' } : undefined,
      totalTimeSpent: Math.floor(Math.random() * 480),
      timeEntries: [],
    }));
  }, [customers]);

  // Track whether we're in the middle of an optimistic drag update
  const [isDragging, setIsDragging] = useState(false);

  // Sync stages when type or data changes (skip during active drag to preserve optimistic state)
  useEffect(() => {
    if (isDragging) return;
    
    const config = type === 'customer' ? CUSTOMER_STAGES_CONFIG : TICKET_STAGES_CONFIG;
    const data = type === 'customer' ? customers : tickets;

    const newStages: PipelineStage[] = config.map(stageConfig => {
      const items = data.filter(item => {
        if (type === 'customer') {
          return (item as Customer).status === stageConfig.statusMatch;
        } else {
          return (item as CustomerTicket).status === stageConfig.statusMatch;
        }
      });

      return {
        id: stageConfig.id,
        name: stageConfig.name,
        color: stageConfig.color,
        items,
        automationEnabled: false,
        target: stageConfig.target,
      };
    });

    setStages(newStages);
  }, [type, customers, tickets, isDragging]);

  // Filter stages based on search
  const filteredStages = useMemo(() => {
    if (!searchQuery.trim()) return stages;

    return stages.map(stage => ({
      ...stage,
      items: stage.items.filter(item => {
        if (type === 'customer') {
          const customer = item as Customer;
          return `${customer.name} ${customer.email}`.toLowerCase().includes(searchQuery.toLowerCase());
        } else {
          const ticket = item as CustomerTicket;
          return `${ticket.subject} ${ticket.ticketNumber}`.toLowerCase().includes(searchQuery.toLowerCase());
        }
      }),
    }));
  }, [stages, searchQuery, type]);

  // Metrics
  const totalItems = useMemo(() => stages.reduce((sum, s) => sum + s.items.length, 0), [stages]);
  
  const completedItems = useMemo(() => {
    const completedStageIds = type === 'customer' ? ['closed'] : ['resolved'];
    return stages
      .filter(s => completedStageIds.includes(s.id))
      .reduce((sum, s) => sum + s.items.length, 0);
  }, [stages, type]);

  const conversionRate = useMemo(() => 
    totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
  [totalItems, completedItems]);

  const handleItemMove = useCallback(async (itemId: string, fromStageId: string, toStageId: string) => {
    if (fromStageId === toStageId) return;

    if (type === 'customer') {
      const statusMap: Record<string, CustomerStatus> = {
        'new': 'new',
        'contacted': 'pending',
        'qualified': 'existing',
        'closed': 'finalised',
      };
      const newStatus = statusMap[toStageId];
      if (newStatus) {
        await updateCustomerStatus(itemId, newStatus);
      }
    }
    // For tickets, would update ticket status similarly
  }, [type, updateCustomerStatus]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const prefix = type === 'customer' ? 'customer-' : 'ticket-';
    
    if (active.id.toString().startsWith(prefix)) {
      const itemId = active.id.toString().replace(prefix, '');
      const allItems = stages.flatMap(s => s.items);
      const item = allItems.find(i => i.id === itemId || i.id === `ticket-${itemId}`);
      setActiveItem(item || null);
    } else {
      setActiveItem(null);
    }
  }, [type, stages]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const prefix = type === 'customer' ? 'customer-' : 'ticket-';
    
    if (active.id.toString().startsWith(prefix)) {
      const itemId = active.id.toString().replace(prefix, '').replace('ticket-', '');
      const targetStageId = over.id.toString();

      // Find source stage
      const sourceStage = stages.find(s => 
        s.items.some(i => i.id === itemId || i.id === `ticket-${itemId}`)
      );

      if (sourceStage && sourceStage.id !== targetStageId) {
        handleItemMove(itemId, sourceStage.id, targetStageId);
      }
      return;
    }

    // Stage reordering
    if (active.id !== over.id) {
      setStages(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, [type, stages, handleItemMove]);

  const addStage = useCallback((stageName: string, color: string) => {
    const newStage: PipelineStage = {
      id: `stage-${Date.now()}`,
      name: stageName,
      color,
      items: [],
      automationEnabled: false,
    };
    setStages(prev => [...prev, newStage]);
    setIsAddStageOpen(false);
  }, []);

  const handleStageEdit = useCallback((stageId: string, name: string, color: string) => {
    setStages(prev => prev.map(stage =>
      stage.id === stageId ? { ...stage, name, color } : stage
    ));
  }, []);

  const handleStageDelete = useCallback((stageId: string) => {
    setStages(prev => prev.filter(stage => stage.id !== stageId));
  }, []);

  const handleAddItem = useCallback((stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;

    if (type === 'customer') {
      // Create a placeholder customer inline
      const newCustomer: Customer = {
        id: `new-${Date.now()}`,
        name: `New Customer`,
        email: `customer-${Date.now()}@example.com`,
        phone: '',
        notes: '',
        status: (CUSTOMER_STAGES_CONFIG.find(c => c.id === stageId)?.statusMatch || 'new') as CustomerStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        ticketCount: 0,
      };
      // Select the new item to open detail panel for editing
      setSelectedItem(newCustomer);
    } else {
      const newTicket: CustomerTicket = {
        id: `ticket-new-${Date.now()}`,
        ticketNumber: `TKT-${Math.floor(Math.random() * 9000) + 1000}`,
        subject: 'New Ticket',
        description: '',
        priority: 'medium',
        status: (TICKET_STAGES_CONFIG.find(c => c.id === stageId)?.statusMatch || 'open') as TicketStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalTimeSpent: 0,
        timeEntries: [],
      };
      setSelectedItem(newTicket);
    }
  }, [stages, type]);

  const handleSetTarget = useCallback((stageId: string, target: number | undefined) => {
    setStages(prev => prev.map(stage =>
      stage.id === stageId ? { ...stage, target } : stage
    ));
  }, []);

  const handleSetAutomation = useCallback((stageId: string, enabled: boolean) => {
    setStages(prev => prev.map(stage =>
      stage.id === stageId ? { ...stage, automationEnabled: enabled } : stage
    ));
  }, []);

  return {
    stages,
    type,
    setType,
    activeItem,
    selectedItem,
    setSelectedItem,
    isAddStageOpen,
    setIsAddStageOpen,
    handleDragStart,
    handleDragEnd,
    handleItemMove,
    addStage,
    handleStageEdit,
    handleStageDelete,
    handleAddItem,
    handleSetTarget,
    handleSetAutomation,
    searchQuery,
    setSearchQuery,
    filteredStages,
    totalItems,
    completedItems,
    conversionRate,
  };
};
