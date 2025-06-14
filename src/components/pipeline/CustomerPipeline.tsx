import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import EnhancedPipelineStage from './EnhancedPipelineStage';
import AddStageDialog from './AddStageDialog';
import PipelineMetrics from './PipelineMetrics';
import { useCRM } from '@/context/CRMContext';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  customers: any[];
  automationEnabled: boolean;
  target?: number;
}

const CustomerPipeline = () => {
  const { customers } = useCRM();
  const [stages, setStages] = useState<PipelineStage[]>([
    {
      id: 'new',
      name: 'New Leads',
      color: '#3b82f6',
      customers: customers.filter(c => c.status === 'new'),
      automationEnabled: false,
      target: 50
    },
    {
      id: 'contacted',
      name: 'Contacted',
      color: '#f59e0b',
      customers: [],
      automationEnabled: false,
      target: 30
    },
    {
      id: 'qualified',
      name: 'Qualified',
      color: '#10b981',
      customers: customers.filter(c => c.status === 'existing'),
      automationEnabled: false,
      target: 20
    },
    {
      id: 'closed',
      name: 'Closed Won',
      color: '#22c55e',
      customers: customers.filter(c => c.status === 'finalised'),
      automationEnabled: false,
      target: 10
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

  const handleCustomerMove = (customerId: string, fromStageId: string, toStageId: string) => {
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
  };

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

  const handleStageEdit = (stageId: string) => {
    console.log('Edit stage:', stageId);
  };

  const handleStageDelete = (stageId: string) => {
    setStages(prev => prev.filter(stage => stage.id !== stageId));
  };

  const handleAddCustomer = (stageId: string) => {
    console.log('Add customer to stage:', stageId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Customer Pipeline</h2>
          <p className="text-muted-foreground">Drag and drop customers between stages</p>
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

      <PipelineMetrics type="customer" stages={stages} />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stages.map(s => s.id)}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <EnhancedPipelineStage
                key={stage.id}
                stage={stage}
                onCustomerMove={handleCustomerMove}
                onStageEdit={handleStageEdit}
                onStageDelete={handleStageDelete}
                onAddItem={handleAddCustomer}
                type="customer"
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

export default CustomerPipeline;
