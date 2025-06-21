interface AutomationJob {
  id: string;
  automationId: string;
  type: 'trigger' | 'action';
  data: any;
  priority: 'low' | 'medium' | 'high';
  scheduledAt?: Date;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface BatchOperation {
  type: string;
  operations: any[];
  batchSize: number;
}

class AutomationPerformanceService {
  private jobQueue: AutomationJob[] = [];
  private runningJobs = new Set<string>();
  private cache = new Map<string, any>();
  private batchOperations = new Map<string, any[]>();
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly BATCH_DELAY = 1000; // 1 second

  constructor() {
    this.startQueueProcessor();
    this.startBatchProcessor();
  }

  // Queue Management
  addJob(job: Omit<AutomationJob, 'id' | 'status' | 'retryCount'>): string {
    const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newJob: AutomationJob = {
      ...job,
      id,
      status: 'pending',
      retryCount: 0
    };

    // Priority insertion
    const insertIndex = this.jobQueue.findIndex(j => 
      this.getPriorityValue(j.priority) < this.getPriorityValue(newJob.priority)
    );
    
    if (insertIndex === -1) {
      this.jobQueue.push(newJob);
    } else {
      this.jobQueue.splice(insertIndex, 0, newJob);
    }

    console.log(`Job ${id} added to queue with priority ${job.priority}`);
    return id;
  }

  private getPriorityValue(priority: 'low' | 'medium' | 'high'): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  private async startQueueProcessor() {
    this.processingInterval = setInterval(async () => {
      await this.processQueue();
    }, 500);
  }

  private async processQueue() {
    const availableSlots = Math.max(0, 5 - this.runningJobs.size); // Max 5 concurrent jobs
    const jobsToProcess = this.jobQueue
      .filter(job => job.status === 'pending' && (!job.scheduledAt || job.scheduledAt <= new Date()))
      .slice(0, availableSlots);

    for (const job of jobsToProcess) {
      this.executeJob(job);
    }
  }

  private async executeJob(job: AutomationJob) {
    if (this.runningJobs.has(job.id)) return;

    this.runningJobs.add(job.id);
    job.status = 'running';

    try {
      console.log(`Executing job ${job.id} of type ${job.type}`);
      
      if (job.type === 'trigger') {
        await this.executeTrigger(job);
      } else {
        await this.executeAction(job);
      }

      job.status = 'completed';
      this.removeJobFromQueue(job.id);
      console.log(`Job ${job.id} completed successfully`);
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      await this.handleJobFailure(job, error);
    } finally {
      this.runningJobs.delete(job.id);
    }
  }

  private async handleJobFailure(job: AutomationJob, error: any) {
    job.retryCount++;
    
    if (job.retryCount < job.maxRetries) {
      job.status = 'pending';
      job.scheduledAt = new Date(Date.now() + Math.pow(2, job.retryCount) * 1000); // Exponential backoff
      console.log(`Job ${job.id} scheduled for retry ${job.retryCount}/${job.maxRetries}`);
    } else {
      job.status = 'failed';
      this.removeJobFromQueue(job.id);
      console.error(`Job ${job.id} failed permanently after ${job.maxRetries} retries`);
    }
  }

  private removeJobFromQueue(jobId: string) {
    const index = this.jobQueue.findIndex(job => job.id === jobId);
    if (index !== -1) {
      this.jobQueue.splice(index, 1);
    }
  }

  // Batch Processing
  addToBatch(type: string, operation: any) {
    if (!this.batchOperations.has(type)) {
      this.batchOperations.set(type, []);
    }
    
    const batch = this.batchOperations.get(type)!;
    batch.push(operation);

    // Auto-process if batch is full
    if (batch.length >= this.BATCH_SIZE) {
      this.processBatch(type);
    }
  }

  private startBatchProcessor() {
    setInterval(() => {
      for (const [type] of this.batchOperations) {
        this.processBatch(type);
      }
    }, this.BATCH_DELAY);
  }

  private async processBatch(type: string) {
    const batch = this.batchOperations.get(type);
    if (!batch || batch.length === 0) return;

    const operations = batch.splice(0, this.BATCH_SIZE);
    console.log(`Processing batch of ${operations.length} ${type} operations`);

    try {
      switch (type) {
        case 'email':
          await this.processBatchEmails(operations);
          break;
        case 'sms':
          await this.processBatchSMS(operations);
          break;
        case 'whatsapp':
          await this.processBatchWhatsApp(operations);
          break;
        case 'database':
          await this.processBatchDatabaseOperations(operations);
          break;
        case 'webhook':
          await this.processBatchWebhooks(operations);
          break;
        default:
          console.warn(`Unknown batch type: ${type}`);
      }
    } catch (error) {
      console.error(`Batch processing failed for ${type}:`, error);
      // Re-queue failed operations
      operations.forEach(op => this.addToBatch(type, op));
    }
  }

  private async processBatchEmails(operations: any[]) {
    // Group emails by template/type for better efficiency
    const grouped = operations.reduce((acc, op) => {
      const key = `${op.template}_${op.type}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(op);
      return acc;
    }, {});

    for (const [key, emails] of Object.entries(grouped)) {
      console.log(`Sending ${(emails as any[]).length} emails of type ${key}`);
      // Simulate batch email sending
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async processBatchSMS(operations: any[]) {
    console.log(`Sending ${operations.length} SMS messages`);
    // Group by priority for better handling
    const grouped = operations.reduce((acc, op) => {
      if (!acc[op.priority]) acc[op.priority] = [];
      acc[op.priority].push(op);
      return acc;
    }, {});

    // Process urgent messages first
    for (const priority of ['urgent', 'high', 'medium', 'low']) {
      if (grouped[priority]) {
        console.log(`Processing ${grouped[priority].length} ${priority} priority SMS messages`);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }

  private async processBatchWhatsApp(operations: any[]) {
    console.log(`Sending ${operations.length} WhatsApp messages`);
    // Group by template for efficiency
    const grouped = operations.reduce((acc, op) => {
      if (!acc[op.template]) acc[op.template] = [];
      acc[op.template].push(op);
      return acc;
    }, {});

    for (const [template, messages] of Object.entries(grouped)) {
      console.log(`Sending ${(messages as any[]).length} messages using template: ${template}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async processBatchDatabaseOperations(operations: any[]) {
    // Group by operation type (INSERT, UPDATE, DELETE)
    const grouped = operations.reduce((acc, op) => {
      if (!acc[op.type]) acc[op.type] = [];
      acc[op.type].push(op);
      return acc;
    }, {});

    for (const [type, ops] of Object.entries(grouped)) {
      console.log(`Executing ${(ops as any[]).length} ${type} operations`);
      // Simulate batch database operations
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  private async processBatchWebhooks(operations: any[]) {
    // Process webhooks concurrently but with rate limiting
    const chunks = this.chunkArray(operations, 5);
    
    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (webhook) => {
        try {
          console.log(`Calling webhook: ${webhook.url}`);
          // Simulate webhook call
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Webhook failed: ${webhook.url}`, error);
        }
      }));
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Caching
  setCache(key: string, value: any, ttl?: number) {
    const expiresAt = Date.now() + (ttl || this.CACHE_TTL);
    this.cache.set(key, { value, expiresAt });
    console.log(`Cached ${key} with TTL ${ttl || this.CACHE_TTL}ms`);
  }

  getCache(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  clearCache(pattern?: string) {
    if (pattern) {
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Asynchronous Execution
  async executeTrigger(job: AutomationJob) {
    const cacheKey = `trigger_${job.automationId}`;
    let triggerConfig = this.getCache(cacheKey);

    if (!triggerConfig) {
      // Simulate loading trigger configuration
      await new Promise(resolve => setTimeout(resolve, 100));
      triggerConfig = { id: job.automationId, conditions: [], actions: [] };
      this.setCache(cacheKey, triggerConfig);
    }

    // Process trigger conditions
    const conditionResults = await Promise.all(
      triggerConfig.conditions.map(async (condition: any) => {
        return await this.evaluateCondition(condition, job.data);
      })
    );

    if (conditionResults.every(result => result)) {
      // Queue actions for execution
      triggerConfig.actions.forEach((action: any) => {
        this.addJob({
          automationId: job.automationId,
          type: 'action',
          data: { ...job.data, action },
          priority: action.priority || 'medium',
          maxRetries: 3
        });
      });
    }
  }

  async executeAction(job: AutomationJob) {
    const { action } = job.data;
    
    switch (action.type) {
      case 'send_email':
        this.addToBatch('email', {
          to: action.recipient,
          template: action.template,
          subject: action.subject,
          body: action.body,
          data: job.data
        });
        break;
      case 'send_sms':
        this.addToBatch('sms', {
          recipient: action.recipient,
          message: action.message,
          priority: action.priority || 'medium'
        });
        break;
      case 'send_whatsapp':
        this.addToBatch('whatsapp', {
          recipient: action.recipient,
          template: action.template,
          parameters: action.parameters || {}
        });
        break;
      case 'schedule_call':
        this.addToBatch('database', {
          type: 'INSERT',
          table: 'scheduled_calls',
          data: action.data
        });
        break;
      case 'update_field':
        this.addToBatch('database', {
          type: 'UPDATE',
          table: action.table,
          data: action.data,
          where: action.conditions
        });
        break;
      case 'call_webhook':
        this.addToBatch('webhook', {
          url: action.url,
          method: action.method || 'POST',
          data: job.data
        });
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  private async evaluateCondition(condition: any, data: any): Promise<boolean> {
    // Simulate condition evaluation
    await new Promise(resolve => setTimeout(resolve, 10));
    return Math.random() > 0.1; // 90% success rate for demo
  }

  // Performance Monitoring
  getQueueStats() {
    const stats = {
      totalJobs: this.jobQueue.length,
      runningJobs: this.runningJobs.size,
      pendingJobs: this.jobQueue.filter(job => job.status === 'pending').length,
      failedJobs: this.jobQueue.filter(job => job.status === 'failed').length,
      cacheSize: this.cache.size,
      batchQueueSizes: Object.fromEntries(
        Array.from(this.batchOperations.entries()).map(([type, ops]) => [type, ops.length])
      )
    };
    return stats;
  }

  // Cleanup
  destroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    this.cache.clear();
    this.batchOperations.clear();
    this.jobQueue.length = 0;
    this.runningJobs.clear();
  }
}

export const automationPerformanceService = new AutomationPerformanceService();
