
import { enhancedAutomationPerformanceService } from '@/services/enhancedAutomationPerformanceService';
import { automationAuditService } from '@/services/automationAuditService';

interface AutomationContext {
  customerId?: string;
  ticketId?: string;
  employeeId?: string;
  triggerData: any;
  metadata?: any;
}

interface ExecutionResult {
  success: boolean;
  jobId?: string;
  error?: string;
  metrics?: any;
}

export class EnhancedAutomationExecutor {
  static async executeAutomation(
    automationId: string, 
    context: AutomationContext,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<ExecutionResult> {
    try {
      console.log(`Executing automation ${automationId} with enhanced monitoring`);
      
      // Execute with comprehensive monitoring and error handling
      const result = await enhancedAutomationPerformanceService.executeAutomationWithMonitoring(
        automationId,
        {
          context,
          timestamp: new Date().toISOString(),
          source: 'enhanced_executor'
        },
        priority
      );

      if (result.success) {
        return { 
          success: true, 
          jobId: `enhanced_${Date.now()}`,
          metrics: result.metrics 
        };
      } else {
        return { 
          success: false, 
          error: result.error,
          metrics: result.metrics 
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log critical execution failure
      await automationAuditService.logAutomationAction(
        automationId,
        'failed',
        {
          error: errorMessage,
          critical: true,
          context,
          executor: 'enhanced'
        }
      );

      return { success: false, error: errorMessage };
    }
  }

  static async bulkExecuteAutomations(automations: Array<{
    automationId: string;
    context: AutomationContext;
    priority?: 'low' | 'medium' | 'high';
  }>): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    
    // Execute in batches to prevent overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < automations.length; i += batchSize) {
      const batch = automations.slice(i, i + batchSize);
      
      const batchPromises = batch.map(automation =>
        this.executeAutomation(
          automation.automationId,
          automation.context,
          automation.priority || 'medium'
        )
      );

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: `Batch execution failed: ${result.reason}`
          });
        }
      });

      // Small delay between batches
      if (i + batchSize < automations.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  static getExecutionStats() {
    return enhancedAutomationPerformanceService.getPerformanceReport();
  }

  static getAutomationStats(automationId: string) {
    return enhancedAutomationPerformanceService.getPerformanceReport(automationId);
  }

  static getSystemHealth() {
    return enhancedAutomationPerformanceService.getOverallHealth();
  }
}
