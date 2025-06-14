
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Settings, Eye } from "lucide-react";
import AutomationBasicInfo from './automation-builder/AutomationBasicInfo';
import AutomationTriggerConfig from './automation-builder/AutomationTriggerConfig';
import AutomationActionsConfig from './automation-builder/AutomationActionsConfig';
import AutomationPreviewTab from './automation-builder/AutomationPreviewTab';

interface AutomationBuilderProps {
  onClose: () => void;
}

const AutomationBuilder = ({ onClose }: AutomationBuilderProps) => {
  const [automationName, setAutomationName] = useState('');
  const [automationType, setAutomationType] = useState<'customer' | 'ticket'>('customer');
  const [triggerType, setTriggerType] = useState<'simple' | 'advanced'>('simple');
  const [simpleTrigger, setSimpleTrigger] = useState('');
  const [conditionGroups, setConditionGroups] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('details');

  const handleSave = () => {
    const currentTrigger = triggerType === 'simple' ? simpleTrigger : { type: 'advanced', conditionGroups };
    
    if (automationName && (simpleTrigger || conditionGroups.length > 0) && actions.length > 0) {
      console.log('Saving enhanced automation:', {
        name: automationName,
        type: automationType,
        triggerType,
        trigger: currentTrigger,
        actions,
        conditionGroups: triggerType === 'advanced' ? conditionGroups : undefined
      });
      onClose();
    }
  };

  const isValid = automationName && 
    ((triggerType === 'simple' && simpleTrigger) || 
     (triggerType === 'advanced' && conditionGroups.length > 0)) && 
    actions.length > 0;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Triggers
          </TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <AutomationBasicInfo
            automationName={automationName}
            setAutomationName={setAutomationName}
            automationType={automationType}
            setAutomationType={setAutomationType}
            triggerType={triggerType}
            setTriggerType={setTriggerType}
          />
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <AutomationTriggerConfig
            triggerType={triggerType}
            automationType={automationType}
            simpleTrigger={simpleTrigger}
            setSimpleTrigger={setSimpleTrigger}
            conditionGroups={conditionGroups}
            setConditionGroups={setConditionGroups}
          />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <AutomationActionsConfig
            actions={actions}
            setActions={setActions}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <AutomationPreviewTab
            automationName={automationName}
            automationType={automationType}
            triggerType={triggerType}
            simpleTrigger={simpleTrigger}
            conditionGroups={conditionGroups}
            actions={actions}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
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
