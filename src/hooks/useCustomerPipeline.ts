
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { arrayMove } from '@dnd-kit/sortable';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { 
  CustomerPipelineStage, 
  CustomerPipelineItem, 
  CustomerPipelineHookReturn 
} from '@/types/pipeline';

export const useCustomerPipeline = (): CustomerPipelineHookReturn => {
  const { customers, updateCustomerStatus } = useCRM();
  const [stages, setStages] = useState<CustomerPipelineStage[]>([
    {
      id: 'new',
      name: 'New Leads',
      color: '#6B7280',
      customers: [],
      automationEnabled: false,
      target: 50
    },
    {
      id: 'contacted',
      name: 'Contacted',
      color: '#374151',
      customers: [],
      automationEnabled: false,
      target: 30
    },
    {
      id: 'qualified',
      name: 'Qualified',
      color: '#059669',
      customers: [],
      automationEnabled: false,
      target: 20
    },
    {
      id: 'closed',
      name: 'Closed Won',
      color: '#1F2937',
      customers: [],
      automationEnabled: false,
      target: 10
    }
  ]);

  // Sync customers with stages whenever customers array changes
  useEffect(() => {
    setStages(prevStages => prevStages.map(stage => {
      let stageCustomers;
      
      if (stage.id === 'new') {
        stageCustomers = customers.filter(c => c.status === 'new');
      } else if (stage.id === 'contacted') {
        stageCustomers = customers.filter(c => c.status === 'pending');
      } else if (stage.id === 'qualified') {
        stageCustomers = customers.filter(c => c.status === 'existing');
      } else if (stage.id === 'closed') {
        stageCustomers = customers.filter(c => c.status === 'finalised');
      } else {
        stageCustomers = stage.customers;
      }
      
      return { ...stage, customers: stageCustomers };
    }));
  }, [customers]);

  const [isAddStageOpen, setIsAddStageOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<CustomerPipelineItem | null>(null);

  const handleCustomerMove = useCallback(async (customerId: string, fromStageId: string, toStageId: string) => {
    // Early return if moving to same stage
    if (fromStageId === toStageId) return;

    // Map stage IDs to customer status
    const statusMap: Record<string, any> = {
      'new': 'new',
      'contacted': 'pending',
      'qualified': 'existing',
      'closed': 'finalised'
    };

    const newStatus = statusMap[toStageId];
    if (newStatus) {
      // Update in database - the useEffect will handle UI updates
      await updateCustomerStatus(customerId, newStatus);
    }
  }, [updateCustomerStatus]);
  
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    
    if (active.id.toString().startsWith('customer-')) {
      const customerId = active.id.toString().replace('customer-', '');
      // Search through customers array directly instead of stages
      const customer = customers.find(c => c.id === customerId);
      setActiveItem(customer || null);
    } else {
      setActiveItem(null);
    }
  }, [customers]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    if (active.id.toString().startsWith('customer-')) {
      const customerId = active.id.toString().replace('customer-', '');
      const targetStageId = over.id.toString();

      // Find source stage from customers array
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const statusToStageMap: Record<string, string> = {
        'new': 'new',
        'pending': 'contacted',
        'existing': 'qualified',
        'finalised': 'closed'
      };
      
      const sourceStageId = statusToStageMap[customer.status || 'new'];

      if (sourceStageId !== targetStageId) {
        handleCustomerMove(customerId, sourceStageId, targetStageId);
      }
      return;
    }

    if (active.id !== over.id && !active.id.toString().startsWith('customer-')) {
      setStages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, [customers, handleCustomerMove]);

  const addStage = (stageName: string, color: string): void => {
    const newStage: CustomerPipelineStage = {
      id: `stage-${Date.now()}`,
      name: stageName,
      color,
      customers: [],
      automationEnabled: false
    };
    setStages(prev => [...prev, newStage]);
    setIsAddStageOpen(false);
  };

  const handleStageEdit = (stageId: string, name: string, color: string): void => {
    console.log('Customer pipeline handleStageEdit called:', stageId, name, color);
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, name, color }
        : stage
    ));
  };

  const handleStageDelete = (stageId: string): void => {
    console.log('Customer pipeline handleStageDelete called:', stageId);
    setStages(prev => prev.filter(stage => stage.id !== stageId));
  };

  const handleAddCustomer = (stageId: string): void => {
    console.log('Add customer to stage:', stageId);
  };

  const handleSetTarget = (stageId: string, target: number | undefined): void => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, target }
        : stage
    ));
  };

  const handleSetAutomation = (stageId: string, automationEnabled: boolean): void => {
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
    handleCustomerMove,
    addStage,
    handleStageEdit,
    handleStageDelete,
    handleAddCustomer,
    handleSetTarget,
    handleSetAutomation
  };
};
