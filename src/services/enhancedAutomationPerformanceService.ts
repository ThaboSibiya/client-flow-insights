import { automationPerformanceService } from './automationPerformanceService';
import { automationAuditService } from './automationAuditService';

interface PerformanceMetrics {
  executionTime: number;
  success: boolean;
  errorMessage?: string;
  retryCount: number;
}

interface QueueHealth {
  status: 'healthy' | 'warning' | 'critical';
  queueSize: number;
  averageWaitTime: number;
  failureRate: number;
}

class EnhancedAutomationPerformanceService {
  private performanceMetrics: Map<string, PerformanceMetrics[]> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHealthMonitoring();
  }

  private startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      this.checkQueueHealth();
    }, 30000); // Check every 30 seconds
  }

  async executeAutomationWithMonitoring(
    automationId: string,
    context: any,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) {
    const startTime = Date.now();
    let success = false;
    let errorMessage: string | undefined;
    let retryCount = 0;

    try {
      // Log execution start
      await automationAuditService.logAutomationAction(
        automationId,
        'executed',
        { context, priority, startTime: new Date(startTime).toISOString() }
      );

      // Execute the automation with enhanced error handling
      const result = await this.executeWithRetry(automationId, context, priority);
      
      success = result.success;
      retryCount = result.retryCount || 0;
      
      if (!success) {
        errorMessage = result.error || 'Unknown error occurred';
        
        // Log execution failure
        await automationAuditService.logAutomationAction(
          automationId,
          'failed',
          { 
            error: errorMessage, 
            retryCount,
            context,
            executionTime: Date.now() - startTime
          }
        );
      }

    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : 'Execution failed';
      
      // Log critical failure
      await automationAuditService.logAutomationAction(
        automationId,
        'failed',
        { 
          error: errorMessage, 
          critical: true,
          context,
          executionTime: Date.now() - startTime
        }
      );
    }

    // Record performance metrics
    const metrics: PerformanceMetrics = {
      executionTime: Date.now() - startTime,
      success,
      errorMessage,
      retryCount
    };

    this.recordMetrics(automationId, metrics);

    return { success, error: errorMessage, metrics };
  }

  private async executeWithRetry(
    automationId: string,
    context: any,
    priority: 'low' | 'medium' | 'high',
    maxRetries: number = 3
  ): Promise<{ success: boolean; error?: string; retryCount?: number }> {
    let lastError: string | undefined;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Use the existing automation performance service
        const jobId = automationPerformanceService.addJob({
          automationId,
          type: 'trigger',
          data: context,
          priority,
          maxRetries: maxRetries - attempt
        });

        // Simulate execution monitoring
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // In a real implementation, you'd monitor the job status
        const success = Math.random() > 0.1; // 90% success rate for demo
        
        if (success) {
          return { success: true, retryCount: attempt };
        } else {
          lastError = `Execution failed on attempt ${attempt + 1}`;
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return { success: false, error: lastError, retryCount: maxRetries };
  }

  private recordMetrics(automationId: string, metrics: PerformanceMetrics) {
    if (!this.performanceMetrics.has(automationId)) {
      this.performanceMetrics.set(automationId, []);
    }

    const automationMetrics = this.performanceMetrics.get(automationId)!;
    automationMetrics.push(metrics);

    // Keep only last 100 metrics per automation
    if (automationMetrics.length > 100) {
      automationMetrics.splice(0, automationMetrics.length - 100);
    }
  }

  private checkQueueHealth(): QueueHealth {
    const stats = automationPerformanceService.getQueueStats();
    
    const queueSize = stats.totalJobs;
    const failureRate = stats.failedJobs / Math.max(stats.totalJobs, 1);
    
    // Calculate average wait time (simplified)
    const averageWaitTime = stats.pendingJobs * 2; // Rough estimate
    
    let status: QueueHealth['status'] = 'healthy';
    
    if (queueSize > 100 || failureRate > 0.2) {
      status = 'critical';
    } else if (queueSize > 50 || failureRate > 0.1) {
      status = 'warning';
    }

    const health: QueueHealth = {
      status,
      queueSize,
      averageWaitTime,
      failureRate
    };

    // Log health status if not healthy
    if (status !== 'healthy') {
      console.warn('Queue health warning:', health);
    }

    return health;
  }

  getAutomationMetrics(automationId: string): PerformanceMetrics[] {
    return this.performanceMetrics.get(automationId) || [];
  }

  getOverallHealth(): QueueHealth {
    return this.checkQueueHealth();
  }

  getPerformanceReport(automationId?: string) {
    if (automationId) {
      const metrics = this.getAutomationMetrics(automationId);
      const successRate = metrics.length > 0 
        ? metrics.filter(m => m.success).length / metrics.length 
        : 0;
      const averageExecutionTime = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length
        : 0;

      return {
        automationId,
        totalExecutions: metrics.length,
        successRate,
        averageExecutionTime,
        recentMetrics: metrics.slice(-10)
      };
    }

    // Overall report
    const allMetrics: PerformanceMetrics[] = [];
    this.performanceMetrics.forEach(metrics => allMetrics.push(...metrics));
    
    const successRate = allMetrics.length > 0 
      ? allMetrics.filter(m => m.success).length / allMetrics.length 
      : 0;
    
    return {
      totalExecutions: allMetrics.length,
      successRate,
      queueHealth: this.getOverallHealth(),
      automationsCount: this.performanceMetrics.size
    };
  }

  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.performanceMetrics.clear();
  }
}

export const enhancedAutomationPerformanceService = new EnhancedAutomationPerformanceService();
