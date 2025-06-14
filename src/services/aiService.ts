
interface LeadScoringData {
  email: string;
  company?: string;
  industry?: string;
  revenue?: number;
  employees?: number;
  websiteVisits?: number;
  emailOpens?: number;
  lastActivity?: string;
  source?: string;
}

interface LeadScore {
  score: number;
  factors: Array<{
    factor: string;
    impact: number;
    reasoning: string;
  }>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recommendations: string[];
}

interface PredictiveAnalytics {
  nextBestAction: string;
  confidence: number;
  reasoning: string;
  timeline: string;
  expectedOutcome: string;
}

interface AssignmentRecommendation {
  userId: string;
  userName: string;
  confidence: number;
  reasoning: string;
  workloadScore: number;
  expertiseMatch: number;
}

export class AIService {
  private static instance: AIService;
  private cache = new Map<string, any>();

  static getInstance(): AIService {
    if (!this.instance) {
      this.instance = new AIService();
    }
    return this.instance;
  }

  async scoreLeads(leadData: LeadScoringData[]): Promise<LeadScore[]> {
    const cacheKey = `lead_scores_${JSON.stringify(leadData)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Simulate AI scoring algorithm
    const scores = leadData.map(lead => this.calculateLeadScore(lead));
    
    this.cache.set(cacheKey, scores);
    setTimeout(() => this.cache.delete(cacheKey), 300000); // 5 min cache
    
    return scores;
  }

  private calculateLeadScore(lead: LeadScoringData): LeadScore {
    let score = 0;
    const factors: Array<{ factor: string; impact: number; reasoning: string }> = [];

    // Company size scoring
    if (lead.employees) {
      const employeeScore = Math.min(lead.employees / 100, 1) * 25;
      score += employeeScore;
      factors.push({
        factor: 'Company Size',
        impact: employeeScore,
        reasoning: `${lead.employees} employees indicates ${lead.employees > 100 ? 'enterprise' : 'SMB'} potential`
      });
    }

    // Revenue scoring
    if (lead.revenue) {
      const revenueScore = Math.min(lead.revenue / 1000000, 1) * 30;
      score += revenueScore;
      factors.push({
        factor: 'Revenue',
        impact: revenueScore,
        reasoning: `$${lead.revenue.toLocaleString()} revenue indicates strong financial capacity`
      });
    }

    // Engagement scoring
    if (lead.websiteVisits) {
      const engagementScore = Math.min(lead.websiteVisits / 10, 1) * 20;
      score += engagementScore;
      factors.push({
        factor: 'Website Engagement',
        impact: engagementScore,
        reasoning: `${lead.websiteVisits} visits shows active interest`
      });
    }

    // Email engagement
    if (lead.emailOpens) {
      const emailScore = Math.min(lead.emailOpens / 5, 1) * 15;
      score += emailScore;
      factors.push({
        factor: 'Email Engagement',
        impact: emailScore,
        reasoning: `${lead.emailOpens} email opens indicates receptiveness`
      });
    }

    // Recency scoring
    if (lead.lastActivity) {
      const daysSince = Math.floor((Date.now() - new Date(lead.lastActivity).getTime()) / (1000 * 60 * 60 * 24));
      const recencyScore = Math.max(0, (7 - daysSince) / 7) * 10;
      score += recencyScore;
      factors.push({
        factor: 'Recent Activity',
        impact: recencyScore,
        reasoning: `Last activity ${daysSince} days ago ${daysSince < 3 ? 'shows hot interest' : 'may be cooling'}`
      });
    }

    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
    if (score >= 80) priority = 'urgent';
    else if (score >= 60) priority = 'high';
    else if (score >= 40) priority = 'medium';

    const recommendations = this.generateRecommendations(score, factors);

    return {
      score: Math.round(score),
      factors,
      priority,
      recommendations
    };
  }

  private generateRecommendations(score: number, factors: any[]): string[] {
    const recommendations: string[] = [];
    
    if (score >= 70) {
      recommendations.push('Schedule immediate demo call');
      recommendations.push('Send personalized proposal');
    } else if (score >= 50) {
      recommendations.push('Send targeted case study');
      recommendations.push('Schedule discovery call');
    } else {
      recommendations.push('Continue nurturing with educational content');
      recommendations.push('Schedule follow-up in 2 weeks');
    }

    // Factor-specific recommendations
    factors.forEach(factor => {
      if (factor.factor === 'Website Engagement' && factor.impact > 15) {
        recommendations.push('Engage based on specific pages visited');
      }
      if (factor.factor === 'Company Size' && factor.impact > 20) {
        recommendations.push('Prepare enterprise-level proposal');
      }
    });

    return recommendations;
  }

  async predictNextAction(historyData: any[]): Promise<PredictiveAnalytics> {
    // Simulate predictive analytics
    const patterns = this.analyzePatterns(historyData);
    
    return {
      nextBestAction: patterns.suggestedAction,
      confidence: patterns.confidence,
      reasoning: patterns.reasoning,
      timeline: patterns.timeline,
      expectedOutcome: patterns.expectedOutcome
    };
  }

  private analyzePatterns(historyData: any[]) {
    // Simplified pattern analysis
    const recentActions = historyData.slice(-5);
    const actionTypes = recentActions.map(action => action.type);
    
    if (actionTypes.includes('email_sent') && !actionTypes.includes('call_made')) {
      return {
        suggestedAction: 'Schedule follow-up call',
        confidence: 0.85,
        reasoning: 'Email engagement detected without follow-up call',
        timeline: 'Within 2-3 days',
        expectedOutcome: '65% chance of moving to next stage'
      };
    }
    
    return {
      suggestedAction: 'Send personalized follow-up',
      confidence: 0.70,
      reasoning: 'Standard progression pattern detected',
      timeline: 'Within 1 week',
      expectedOutcome: '45% chance of positive response'
    };
  }

  async recommendAssignment(ticketData: any, availableUsers: any[]): Promise<AssignmentRecommendation[]> {
    // Simulate intelligent assignment
    return availableUsers.map(user => {
      const workloadScore = this.calculateWorkloadScore(user);
      const expertiseMatch = this.calculateExpertiseMatch(ticketData, user);
      const confidence = (workloadScore + expertiseMatch) / 2;
      
      return {
        userId: user.id,
        userName: user.name,
        confidence,
        reasoning: this.generateAssignmentReasoning(workloadScore, expertiseMatch),
        workloadScore,
        expertiseMatch
      };
    }).sort((a, b) => b.confidence - a.confidence);
  }

  private calculateWorkloadScore(user: any): number {
    const currentTickets = user.currentTickets || 0;
    const maxCapacity = user.maxCapacity || 10;
    return Math.max(0, (maxCapacity - currentTickets) / maxCapacity);
  }

  private calculateExpertiseMatch(ticketData: any, user: any): number {
    const ticketTags = ticketData.tags || [];
    const userSkills = user.skills || [];
    const matches = ticketTags.filter((tag: string) => userSkills.includes(tag));
    return matches.length / Math.max(ticketTags.length, 1);
  }

  private generateAssignmentReasoning(workloadScore: number, expertiseMatch: number): string {
    const reasons = [];
    
    if (workloadScore > 0.7) reasons.push('Low current workload');
    if (expertiseMatch > 0.7) reasons.push('Strong expertise match');
    if (workloadScore < 0.3) reasons.push('High current workload');
    if (expertiseMatch < 0.3) reasons.push('Limited expertise match');
    
    return reasons.join(', ') || 'Balanced assignment based on availability';
  }

  async generateContent(context: any, type: 'email' | 'message' | 'note'): Promise<string> {
    // Simulate AI content generation
    const templates = {
      email: this.generateEmailContent(context),
      message: this.generateMessageContent(context),
      note: this.generateNoteContent(context)
    };
    
    return templates[type];
  }

  private generateEmailContent(context: any): string {
    const customerName = context.customerName || 'there';
    const lastInteraction = context.lastInteraction || 'our last conversation';
    
    return `Hi ${customerName},

I wanted to follow up on ${lastInteraction}. Based on our discussion, I think there might be some valuable opportunities for us to explore together.

Would you be available for a brief call this week to discuss how we can help address your ${context.primaryNeed || 'business needs'}?

Looking forward to hearing from you.

Best regards,
${context.senderName || 'The Team'}`;
  }

  private generateMessageContent(context: any): string {
    return `Quick follow-up on your recent inquiry about ${context.topic || 'our services'}. I have some insights that might be helpful. When would be a good time to connect?`;
  }

  private generateNoteContent(context: any): string {
    return `Follow-up required: Customer showed interest in ${context.topic || 'our solution'}. Next steps: ${context.nextSteps || 'Schedule discovery call to understand requirements better.'} Priority: ${context.priority || 'Medium'}`;
  }
}

export const aiService = AIService.getInstance();
