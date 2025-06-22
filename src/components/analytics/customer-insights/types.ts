
export interface SatisfactionSurvey {
  id: string;
  customerId: string;
  jobId: string;
  customerName: string;
  jobType: string;
  completedAt: string;
  surveyStatus: 'pending' | 'sent' | 'completed' | 'expired';
  responses?: {
    overallSatisfaction: number;
    serviceQuality: number;
    timeliness: number;
    communication: number;
    likelihood_to_recommend: number;
    feedback?: string;
  };
  sentAt?: string;
  completedAt?: string;
  remindersSent: number;
}

export interface ChurnPrediction {
  id: string;
  customerId: string;
  customerName: string;
  churnRisk: 'low' | 'medium' | 'high' | 'critical';
  churnScore: number; // 0-100
  lastInteraction: string;
  predictedChurnDate: string;
  riskFactors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
  confidence: number;
}

export interface CrossSellOpportunity {
  id: string;
  customerId: string;
  customerName: string;
  opportunityType: 'product_upgrade' | 'additional_service' | 'premium_plan' | 'bundle_offer';
  suggestedProduct: string;
  estimatedValue: number;
  probability: number;
  reasoning: string[];
  bestContactTime: string;
  priority: 'low' | 'medium' | 'high';
  status: 'identified' | 'pitched' | 'converted' | 'declined';
}

export interface CustomerLifetimeValue {
  id: string;
  customerId: string;
  customerName: string;
  currentLTV: number;
  predictedLTV: number;
  acquisitionCost: number;
  totalRevenue: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  customerLifespan: number; // in months
  profitMargin: number;
  ltv_cac_ratio: number;
  segment: 'high_value' | 'medium_value' | 'low_value' | 'at_risk';
  trends: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export interface CustomerInsightsSettings {
  satisfactionSurveys: {
    enabled: boolean;
    autoSendAfterCompletion: boolean;
    surveyDelay: number; // hours after completion
    reminderFrequency: number; // days
    maxReminders: number;
    expiryDays: number;
  };
  churnPrediction: {
    enabled: boolean;
    updateFrequency: 'daily' | 'weekly';
    riskThreshold: number;
    factorsToTrack: string[];
  };
  crossSell: {
    enabled: boolean;
    minProbability: number;
    updateFrequency: 'daily' | 'weekly';
    opportunityTypes: string[];
  };
  ltvCalculation: {
    enabled: boolean;
    calculationMethod: 'historical' | 'predictive' | 'both';
    updateFrequency: 'daily' | 'weekly' | 'monthly';
    includeProfitMargin: boolean;
  };
}
