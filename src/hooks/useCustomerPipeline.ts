
import { useState, useCallback, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { arrayMove } from '@dnd-kit/sortable';
import { DragStartEvent, DragEndEvent } from '@dnd-kit/core';

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  customers: any[];
  automationEnabled: boolean;
  target?: number;
}

export const useCustomerPipeline = () => {
  const { customers } = useCRM();
  const [stages, setStages] = useState<PipelineStage[]>(() => [
    {
      id: 'new',
      name: 'New Leads',
      color: '#6B7280',
      customers: customers.filter(c => c.status === 'new'),
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
      customers: customers.filter(c => c.status === 'existing'),
      automationEnabled: false,
      target: 20
    },
    {
      id: 'closed',
      name: 'Closed Won',
      color: '#1F2937',
      customers: customers.filter(c => c.status === 'finalised'),
      automationEnabled: false,
      target: 10
    }
  ]);

  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<any | null>(null);

  const handleCustomerMove = useCallback((customerId: string, fromStageId: string, toStageId: string) => {
    setStages(prevStages => {
      const newStages = [...prevStages];
      const fromStage = newStages.find(s => s.id === fromStageId);
      const toStage = newStages.find(s => s.id === toStageId);
      
      if (fromStage && toStage) {
        const customer = fromStage.customers.find(c => c.id === customerId);
        if (customer) {
          fromStage.customers = fromStage.customers.filter(c => c.id !== customerId);
          toStage.customers.push(customer);
        }
      }
      
      return newStages;
    });
  }, []);
  
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    
    if (active.id.toString().startsWith('customer-')) {
      const customerId = active.id.toString().replace('customer-', '');
      const customer = stages
        .flatMap(stage => stage.customers || [])
        .find(c => c.id === customerId);
      setActiveItem(customer);
    } else {
      setActiveItem(null);
    }
  }, [stages]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    if (active.id.toString().startsWith('customer-')) {
      const customerId = active.id.toString().replace('customer-', '');
      const targetStageId = over.id.toString();

      const sourceStage = stages.find(stage => 
        (stage.customers || []).some(c => c.id === customerId)
      );

      if (sourceStage && sourceStage.id !== targetStageId) {
        handleCustomerMove(customerId, sourceStage.id, targetStageId);
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
  }, [stages, handleCustomerMove]);

  const addStage = (stageName: string, color: string) => {
    const newStage: PipelineStage = {
      id: `stage-${Date.now()}`,
      name: stageName,
      color,
      customers: [],
      automationEnabled: false
    };
    setStages(prev => [...prev, newStage]);
    setIsAddStageOpen(false);
  };

  const handleStageEdit = (stageId: string, name: string, color: string) => {
    console.log('Customer pipeline handleStageEdit called:', stageId, name, color);
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, name, color }
        : stage
    ));
  };

  const handleStageDelete = (stageId: string) => {
    console.log('Customer pipeline handleStageDelete called:', stageId);
    setStages(prev => prev.filter(stage => stage.id !== stageId));
  };

  const handleAddCustomer = (stageId: string) => {
    console.log('Add customer to stage:', stageId);
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
    handleCustomerMove,
    addStage,
    handleStageEdit,
    handleStageDelete,
    handleAddCustomer,
    handleSetTarget,
    handleSetAutomation
  };
};
