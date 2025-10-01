
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Settings, Eye, GitBranch } from "lucide-react";
import AutomationBasicInfo from './automation-builder/AutomationBasicInfo';
import AutomationTriggerConfig from './automation-builder/AutomationTriggerConfig';
import AutomationActionsConfig from './automation-builder/AutomationActionsConfig';
import AutomationWorkflowConfig from './automation-builder/AutomationWorkflowConfig';
import AutomationPreviewTab from './automation-builder/AutomationPreviewTab';

interface AutomationBuilderProps {
  onClose: () => void;
  initialData?: any;
}

const AutomationBuilder = ({ onClose, initialData = {} }: AutomationBuilderProps) => {
  const [automationName, setAutomationName] = useState(initialData.automationName || '');
  const [automationType, setAutomationType] = useState<'customer' | 'ticket'>(initialData.automationType || 'customer');
  const [triggerType, setTriggerType] = useState<'simple' | 'advanced'>(initialData.triggerType || 'simple');
  const [simpleTrigger, setSimpleTrigger] = useState(initialData.simpleTrigger || '');
  const [conditionGroups, setConditionGroups] = useState<any[]>(initialData.conditionGroups || []);
  const [actions, setActions] = useState<any[]>(initialData.actions || []);
  const [workflow, setWorkflow] = useState(initialData.workflow || { nodes: [], edges: [] });
  const [activeTab, setActiveTab] = useState('details');

  const handleSave = () => {
    const currentTrigger = triggerType === 'simple' ? simpleTrigger : { type: 'advanced', conditionGroups };
    
    if (automationName && (simpleTrigger || conditionGroups.length > 0) && (actions.length > 0 || workflow.nodes.length > 0)) {
      console.log('Saving enhanced automation:', {
        name: automationName,
        type: automationType,
        triggerType,
        trigger: currentTrigger,
        actions,
        workflow,
        conditionGroups: triggerType === 'advanced' ? conditionGroups : undefined
      });
      onClose();
    }
  };

  const isValid = automationName && 
    ((triggerType === 'simple' && simpleTrigger) || 
     (triggerType === 'advanced' && conditionGroups.length > 0)) && 
    (actions.length > 0 || workflow.nodes.length > 0);

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-5 flex-shrink-0">
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Triggers
          </TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-1">
            <GitBranch className="h-4 w-4" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto min-h-0 pb-4">
            <TabsContent value="details" className="space-y-4 m-0">
              <AutomationBasicInfo
                automationName={automationName}
                setAutomationName={setAutomationName}
                automationType={automationType}
                setAutomationType={setAutomationType}
                triggerType={triggerType}
                setTriggerType={setTriggerType}
              />
            </TabsContent>
    
            <TabsContent value="triggers" className="space-y-4 m-0">
              <AutomationTriggerConfig
                triggerType={triggerType}
                automationType={automationType}
                simpleTrigger={simpleTrigger}
                setSimpleTrigger={setSimpleTrigger}
                conditionGroups={conditionGroups}
                setConditionGroups={setConditionGroups}
              />
            </TabsContent>
    
            <TabsContent value="actions" className="space-y-4 m-0">
              <AutomationActionsConfig
                actions={actions}
                setActions={setActions}
              />
            </TabsContent>
    
            <TabsContent value="workflow" className="h-full m-0">
              <AutomationWorkflowConfig
                workflow={workflow}
                setWorkflow={setWorkflow}
              />
            </TabsContent>
    
            <TabsContent value="preview" className="space-y-4 m-0">
              <AutomationPreviewTab
                automationName={automationName}
                automationType={automationType}
                triggerType={triggerType}
                simpleTrigger={simpleTrigger}
                conditionGroups={conditionGroups}
                actions={actions}
              />
            </TabsContent>
        </div>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0 bg-background">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!isValid}
          className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white"
        >
          Save Automation
        </Button>
      </div>
    </div>
  );
};

export default AutomationBuilder;
