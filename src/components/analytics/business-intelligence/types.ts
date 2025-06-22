
export interface DashboardEmailSettings {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  dashboardType: 'overview' | 'sales' | 'customers' | 'tickets' | 'performance';
  enabled: boolean;
  lastSent: string;
  nextScheduled: string;
  includeCharts: boolean;
  includeMetrics: boolean;
  customFilters?: {
    dateRange?: string;
    departments?: string[];
    priority?: string[];
  };
}

export interface AnomalyAlert {
  id: string;
  type: 'spike' | 'drop' | 'trend_change' | 'outlier';
  metric: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  isResolved: boolean;
  affectedArea: string;
}

export interface ForecastData {
  id: string;
  metric: string;
  period: 'week' | 'month' | 'quarter';
  currentValue: number;
  forecastValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  updatedAt: string;
  factors: string[];
  recommendations: string[];
}

export interface CompetitorAlert {
  id: string;
  competitor: string;
  alertType: 'pricing' | 'feature' | 'market_share' | 'campaign' | 'review';
  title: string;
  description: string;
  source: string;
  impact: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  detectedAt: string;
  url?: string;
  data?: any;
}

export interface BusinessIntelligenceSettings {
  anomalyDetection: {
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    metrics: string[];
    alertThreshold: number;
    checkFrequency: 'hourly' | 'daily';
  };
  forecasting: {
    enabled: boolean;
    updateFrequency: 'daily' | 'weekly';
    confidenceThreshold: number;
    forecastHorizon: number;
  };
  competitorTracking: {
    enabled: boolean;
    competitors: string[];
    trackingAreas: string[];
    alertFrequency: 'immediate' | 'daily' | 'weekly';
  };
}
