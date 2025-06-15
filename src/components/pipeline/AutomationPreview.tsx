
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, TestTube2 } from "lucide-react";
import { useCustomerData } from '@/hooks/useCustomerData';
import { useAutomationSimulator } from '@/hooks/useAutomationSimulator';
import AutomationSummary from './automation-preview/AutomationSummary';
import TestDataSelector from './automation-preview/TestDataSelector';
import AutomationFlow from './automation-preview/AutomationFlow';
import SimulationLog from './automation-preview/SimulationLog';

interface PreviewProps {
  automationName: string;
  automationType: 'customer' | 'ticket';
  triggerType: 'simple' | 'advanced';
  actions: any[];
  conditionGroups?: any[];
  simpleTrigger: string;
}

const AutomationPreview = ({ 
  automationName, 
  automationType, 
  triggerType, 
  actions,
  conditionGroups = [],
  simpleTrigger,
}: PreviewProps) => {
  const [selectedRecordId, setSelectedRecordId] = React.useState<string | null>(null);
  const { customers } = useCustomerData();

  const {
    isSimulating,
    simulationStep,
    simulationLog,
    triggerEvalResult,
    simulateExecution,
    resetSimulation,
  } = useAutomationSimulator({
    automationType,
    customers,
    actions,
    conditionGroups,
    simpleTrigger,
    triggerType,
    selectedRecordId,
  });

  React.useEffect(() => {
    resetSimulation();
  }, [selectedRecordId, resetSimulation]);

  const isValid = automationName && (simpleTrigger || (triggerType === 'advanced' && conditionGroups.length > 0)) && actions.length > 0;

  return (
    <div className="space-y-4">
      <AutomationSummary 
        automationName={automationName}
        automationType={automationType}
        triggerType={triggerType}
        actions={actions}
        conditionGroups={conditionGroups}
        simpleTrigger={simpleTrigger}
      />
      
      <Card className="border-2 border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TestTube2 className={`h-5 w-5 ${isValid ? 'text-blue-500' : 'text-gray-400'}`} />
              Automation Test Lab
            </CardTitle>
            <Button 
              size="sm" 
              onClick={simulateExecution}
              disabled={!isValid || isSimulating || !selectedRecordId}
              className="flex items-center gap-1"
            >
              <Play className="h-3 w-3" />
              {isSimulating ? 'Simulating...' : 'Run Test with Data'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <TestDataSelector
            automationType={automationType}
            selectedRecordId={selectedRecordId}
            onRecordSelect={setSelectedRecordId}
          />

          <AutomationFlow
            automationName={automationName}
            automationType={automationType}
            triggerType={triggerType}
            actions={actions}
            conditionGroups={conditionGroups}
            simpleTrigger={simpleTrigger}
            isValid={isValid}
            isSimulating={isSimulating}
            simulationStep={simulationStep}
            triggerEvalResult={triggerEvalResult}
          />

          <SimulationLog log={simulationLog} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationPreview;
