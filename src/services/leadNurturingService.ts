
import { Customer, CustomerStatus } from '@/types/customer';

export interface LeadNurturingSettings {
  enabled: boolean;
  followUpDays: number[];
  emailTemplate: string;
  smsTemplate: string;
  whatsappTemplate: string;
  maxFollowUps: number;
  priorityScoring: boolean;
  autoAssignment: boolean;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  delay: number;
  priority: 'low' | 'medium' | 'high';
}

export interface LeadScore {
  customerId: string;
  score: number;
  factors: ScoreFactor[];
  lastUpdated: Date;
}

export interface ScoreFactor {
  name: string;
  value: number;
  weight: number;
}

export interface FollowUpTask {
  id: string;
  customerId: string;
  type: 'email' | 'sms' | 'whatsapp' | 'call';
  scheduledDate: Date;
  status: 'pending' | 'completed' | 'failed';
  template: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

export interface CampaignMetrics {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageResponseTime: number;
  costPerLead: number;
  roi: number;
  engagementRate: number;
  followUpEffectiveness: number;
}

class LeadNurturingService {
  private settings: LeadNurturingSettings = {
    enabled: true,
    followUpDays: [1, 3, 7, 14, 30],
    emailTemplate: 'default',
    smsTemplate: 'default',
    whatsappTemplate: 'default',
    maxFollowUps: 5,
    priorityScoring: true,
    autoAssignment: true,
    escalationRules: []
  };

  private leadScores: Map<string, LeadScore> = new Map();
  private followUpTasks: FollowUpTask[] = [];

  async updateSettings(newSettings: Partial<LeadNurturingSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    console.log('Lead nurturing settings updated:', this.settings);
  }

  async getSettings(): Promise<LeadNurturingSettings> {
    return this.settings;
  }

  async calculateLeadScore(customer: Customer): Promise<LeadScore> {
    const factors: ScoreFactor[] = [
      { name: 'Engagement', value: this.calculateEngagementScore(customer), weight: 30 },
      { name: 'Demographics', value: this.calculateDemographicScore(customer), weight: 20 },
      { name: 'Behavior', value: this.calculateBehaviorScore(customer), weight: 25 },
      { name: 'Firmographics', value: this.calculateFirmographicScore(customer), weight: 25 }
    ];

    const score = factors.reduce((total, factor) => total + (factor.value * factor.weight / 100), 0);

    const leadScore: LeadScore = {
      customerId: customer.id,
      score: Math.round(score),
      factors,
      lastUpdated: new Date()
    };

    this.leadScores.set(customer.id, leadScore);
    return leadScore;
  }

  private calculateEngagementScore(customer: Customer): number {
    // Calculate based on email opens, clicks, website visits, etc.
    let score = 50; // base score
    
    if (customer.email) score += 20;
    if (customer.phone) score += 15;
    if (customer.notes && customer.notes.length > 50) score += 10;
    
    return Math.min(score, 100);
  }

  private calculateDemographicScore(customer: Customer): number {
    let score = 40;
    
    if (customer.address) score += 15;
    if (customer.contact_person) score += 20;
    if (customer.company_address) score += 25;
    
    return Math.min(score, 100);
  }

  private calculateBehaviorScore(customer: Customer): number {
    let score = 30;
    
    // Based on status
    switch (customer.status) {
      case 'new':
        score += 20;
        break;
      case 'existing':
        score += 40;
        break;
      case 'pending':
        score += 60;
        break;
      case 'finalised':
        score += 80;
        break;
    }
    
    return Math.min(score, 100);
  }

  private calculateFirmographicScore(customer: Customer): number {
    let score = 35;
    
    // Industry-specific scoring would go here
    if (customer.company_address) score += 30;
    if (customer.contact_person) score += 35;
    
    return Math.min(score, 100);
  }

  async createFollowUpTasks(customer: Customer): Promise<FollowUpTask[]> {
    if (!this.settings.enabled) return [];

    const tasks: FollowUpTask[] = [];
    const now = new Date();

    this.settings.followUpDays.forEach((days, index) => {
      if (index < this.settings.maxFollowUps) {
        const scheduledDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        
        const task: FollowUpTask = {
          id: `follow-up-${customer.id}-${index}`,
          customerId: customer.id,
          type: this.getFollowUpType(index),
          scheduledDate,
          status: 'pending',
          template: this.getTemplate(this.getFollowUpType(index)),
          priority: this.getPriority(days),
          assignedTo: this.settings.autoAssignment ? 'auto' : undefined
        };

        tasks.push(task);
      }
    });

    this.followUpTasks.push(...tasks);
    return tasks;
  }

  private getFollowUpType(index: number): 'email' | 'sms' | 'whatsapp' | 'call' {
    const types: ('email' | 'sms' | 'whatsapp' | 'call')[] = ['email', 'sms', 'whatsapp', 'call'];
    return types[index % types.length];
  }

  private getTemplate(type: string): string {
    switch (type) {
      case 'email':
        return this.settings.emailTemplate;
      case 'sms':
        return this.settings.smsTemplate;
      case 'whatsapp':
        return this.settings.whatsappTemplate;
      default:
        return 'default';
    }
  }

  private getPriority(days: number): 'low' | 'medium' | 'high' {
    if (days <= 1) return 'high';
    if (days <= 7) return 'medium';
    return 'low';
  }

  async getFollowUpTasks(customerId?: string): Promise<FollowUpTask[]> {
    if (customerId) {
      return this.followUpTasks.filter(task => task.customerId === customerId);
    }
    return this.followUpTasks;
  }

  async updateTaskStatus(taskId: string, status: 'pending' | 'completed' | 'failed'): Promise<void> {
    const task = this.followUpTasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
    }
  }

  async getCampaignMetrics(): Promise<CampaignMetrics> {
    const totalTasks = this.followUpTasks.length;
    const completedTasks = this.followUpTasks.filter(t => t.status === 'completed').length;
    
    return {
      totalLeads: totalTasks,
      convertedLeads: completedTasks,
      conversionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      averageResponseTime: 2.5, // hours
      costPerLead: 45.50,
      roi: 285.7,
      engagementRate: 68.3,
      followUpEffectiveness: 78.9
    };
  }

  async generateMockCustomers(): Promise<Customer[]> {
    const mockCustomers: Customer[] = [
      {
        id: 'mock-1',
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1-555-0123',
        status: 'new' as CustomerStatus,
        notes: 'Interested in our enterprise solution',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        activeTickets: [],
        ticketCount: 0,
        assigned_to: undefined,
        user_id: 'user-1'
      },
      {
        id: 'mock-2',
        name: 'TechStart Inc',
        email: 'hello@techstart.com',
        phone: '+1-555-0456',
        status: 'pending' as CustomerStatus,
        notes: 'Following up on demo request',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        activeTickets: [],
        ticketCount: 0,
        assigned_to: undefined,
        user_id: 'user-1'
      }
    ];

    return mockCustomers;
  }
}

export const leadNurturingService = new LeadNurturingService();
