
import { automationPerformanceService } from '@/services/automationPerformanceService';

interface AutomationContext {
  customerId?: string;
  ticketId?: string;
  employeeId?: string;
  triggerData: any;
  metadata?: any;
}

export class AutomationExecutor {
  static async executeAutomation(
    automationId: string, 
    context: AutomationContext,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) {
    try {
      console.log(`Executing automation ${automationId} with priority ${priority}`);
      
      // Add to performance-optimized queue
      const jobId = automationPerformanceService.addJob({
        automationId,
        type: 'trigger',
        data: {
          context,
          timestamp: new Date().toISOString(),
          source: 'manual_trigger'
        },
        priority,
        maxRetries: 3
      });

      return { success: true, jobId };
    } catch (error) {
      console.error('Failed to execute automation:', error);
      return { success: false, error: error.message };
    }
  }

  static async bulkExecuteAutomations(automations: Array<{
    automationId: string;
    context: AutomationContext;
    priority?: 'low' | 'medium' | 'high';
  }>) {
    const results = [];
    
    for (const automation of automations) {
      const result = await this.executeAutomation(
        automation.automationId,
        automation.context,
        automation.priority || 'medium'
      );
      results.push({ ...automation, result });
    }

    return results;
  }

  static getExecutionStats() {
    return automationPerformanceService.getQueueStats();
  }
}
