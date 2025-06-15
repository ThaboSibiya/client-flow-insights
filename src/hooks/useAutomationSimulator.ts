
import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import { evaluateCondition } from '@/utils/automation/evaluateCondition';
import { Customer } from '@/types/customer';

interface UseAutomationSimulatorProps {
  automationType: 'customer' | 'ticket';
  customers: Customer[];
  actions: any[];
  conditionGroups?: any[];
  simpleTrigger: string;
  triggerType: 'simple' | 'advanced';
  selectedRecordId: string | null;
}

export const useAutomationSimulator = ({
  automationType,
  customers,
  actions,
  conditionGroups = [],
  simpleTrigger,
  triggerType,
  selectedRecordId,
}: UseAutomationSimulatorProps) => {
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [simulationStep, setSimulationStep] = React.useState(0);
  const [simulationLog, setSimulationLog] = React.useState<string[]>([]);
  const [triggerEvalResult, setTriggerEvalResult] = React.useState<'pass' | 'fail' | null>(null);
  const { toast } = useToast();

  const simulateExecution = async () => {
    if (!selectedRecordId) {
      toast({ title: "Please select a record to test with.", variant: "destructive" });
      return;
    }
    const selectedRecord = automationType === 'customer' ? customers.find(c => c.id === selectedRecordId) : null;
    if (!selectedRecord) {
      toast({ title: "Selected record not found.", variant: "destructive" });
      return;
    }

    setIsSimulating(true);
    setTriggerEvalResult(null);
    const newLog: string[] = [];
    const addLog = (message: string) => {
      newLog.push(`[${new Date().toLocaleTimeString()}] ${message}`);
      setSimulationLog([...newLog]);
    };
    
    addLog(`[START] Simulating with ${automationType}: ${selectedRecord.name}`);
    setSimulationStep(0); // Trigger step
    await new Promise(r => setTimeout(r, 200));

    let triggerMet = false;
    if (triggerType === 'simple') {
      triggerMet = true;
      addLog(`[TRIGGER] Simple trigger "${simpleTrigger}" assumed PASSED for simulation.`);
    } else {
      addLog(`[TRIGGER] Evaluating advanced trigger conditions...`);
      let overallResult = true; // Assumes AND logic between groups for now
      for (const [i, group] of conditionGroups.entries()) {
        addLog(` -> Evaluating Group ${i + 1} (${group.logic})`);
        const conditionResults: boolean[] = [];
        for (const condition of group.conditions) {
          const { met, log } = evaluateCondition(condition, selectedRecord);
          conditionResults.push(met);
          addLog(`    - ${log}`);
          await new Promise(r => setTimeout(r, 50));
        }
        const groupResult = group.logic === 'AND' ? conditionResults.every(r => r) : conditionResults.some(r => r);
        addLog(` -> Group ${i + 1} result: ${groupResult ? 'PASSED' : 'FAILED'}`);
        if (!groupResult) {
          overallResult = false;
          break;
        }
      }
      triggerMet = overallResult;
    }
    
    setTriggerEvalResult(triggerMet ? 'pass' : 'fail');
    addLog(`[TRIGGER] Overall result: ${triggerMet ? 'PASSED' : 'FAILED'}`);

    if (triggerMet) {
      for (let i = 0; i < actions.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setSimulationStep(i + 1);
        addLog(` -> Executing Action ${i + 1}: ${actions[i].name}.`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      setSimulationStep(actions.length + 1);
      addLog(`[END] Simulation finished successfully.`);
    } else {
      addLog(`[END] Automation did not run.`);
    }

    setIsSimulating(false);
  };

  const resetSimulation = React.useCallback(() => {
    setSimulationLog([]);
    setTriggerEvalResult(null);
    setSimulationStep(0);
    setIsSimulating(false);
  }, []);

  return {
    isSimulating,
    simulationStep,
    simulationLog,
    triggerEvalResult,
    simulateExecution,
    resetSimulation,
  };
};
