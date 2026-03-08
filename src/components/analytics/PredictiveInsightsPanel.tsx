
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAnalytics } from '@/context/AnalyticsContext';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  DollarSign,
  Users,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

interface Prediction {
  label: string;
  value: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  detail: string;
}

interface RiskSegment {
  segment: string;
  riskScore: number;
  count: number;
  action: string;
}

const PredictiveInsightsPanel: React.FC = () => {
  const { metrics, customerTimeSeries, revenueTimeSeries, ticketTimeSeries, isLoading } = useAnalytics();

  // --- Customer Lifetime Value prediction ---
  const clvPrediction = useMemo(() => {
    if (!metrics || !revenueTimeSeries.length) return null;
    const totalCustomers = metrics.totalCustomers || 1;
    const totalRevenue = revenueTimeSeries.reduce((s, d) => s + d.value, 0);
    const avgRevenuePerCustomer = totalRevenue / totalCustomers;
    const retentionRate = metrics.totalCustomers > 0
      ? 1 - (metrics.finalisedCustomers / metrics.totalCustomers)
      : 0.8;
    // Simplified CLV = ARPC * (retention / (1 - retention))
    const clv = retentionRate < 1
      ? avgRevenuePerCustomer * (retentionRate / (1 - retentionRate))
      : avgRevenuePerCustomer * 12;
    return { clv: Math.round(clv), avgRevenue: Math.round(avgRevenuePerCustomer), retentionRate };
  }, [metrics, revenueTimeSeries]);

  // --- Growth trajectory prediction ---
  const growthPrediction = useMemo(() => {
    if (customerTimeSeries.length < 2) return null;
    const values = customerTimeSeries.map(d => d.value);
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    values.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) ** 2; });
    const slope = den !== 0 ? num / den : 0;
    const next3MonthPrediction = Math.max(0, Math.round(yMean + slope * (n + 1)));
    const trend: 'up' | 'down' | 'stable' = slope > 0.5 ? 'up' : slope < -0.5 ? 'down' : 'stable';
    const confidence = Math.min(95, Math.max(40, 60 + Math.abs(slope) * 10));
    return { next3MonthPrediction, slope: Math.round(slope * 100) / 100, trend, confidence: Math.round(confidence) };
  }, [customerTimeSeries]);

  // --- Churn risk segments ---
  const churnRiskSegments = useMemo((): RiskSegment[] => {
    if (!metrics) return [];
    const pending = metrics.pendingCustomers;
    const finalised = metrics.finalisedCustomers;
    const active = metrics.activeCustomers;
    const newC = metrics.newCustomers;
    const total = metrics.totalCustomers || 1;

    return [
      {
        segment: 'Inactive (Pending)',
        riskScore: Math.min(100, Math.round((pending / total) * 100 * 2.5)),
        count: pending,
        action: 'Send re-engagement campaign',
      },
      {
        segment: 'Recently Finalized',
        riskScore: Math.min(100, Math.round((finalised / total) * 100 * 1.5)),
        count: finalised,
        action: 'Review exit surveys & offer win-back',
      },
      {
        segment: 'New (< 30 days)',
        riskScore: Math.min(100, Math.round(Math.max(10, 50 - (newC / total) * 100))),
        count: newC,
        action: 'Onboarding follow-up sequence',
      },
      {
        segment: 'Active / Healthy',
        riskScore: Math.max(5, Math.round(15 - (active / total) * 10)),
        count: active,
        action: 'Upsell & loyalty program',
      },
    ].sort((a, b) => b.riskScore - a.riskScore);
  }, [metrics]);

  // --- Revenue next-quarter forecast ---
  const revenueForecast = useMemo(() => {
    if (revenueTimeSeries.length < 2) return null;
    const values = revenueTimeSeries.map(d => d.value);
    const last = values[values.length - 1];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const growth = avg > 0 ? ((last - avg) / avg) : 0;
    const forecast = Math.round(last * (1 + growth) * 3);
    const confidence = Math.min(90, Math.max(45, 65 + growth * 50));
    return { forecast, growth: Math.round(growth * 100), confidence: Math.round(confidence) };
  }, [revenueTimeSeries]);

  // --- Ticket volume prediction ---
  const ticketPrediction = useMemo(() => {
    if (ticketTimeSeries.length < 2) return null;
    const values = ticketTimeSeries.map(d => d.value);
    const last = values[values.length - 1];
    const prev = values[values.length - 2];
    const trend: 'up' | 'down' | 'stable' = last > prev ? 'up' : last < prev ? 'down' : 'stable';
    const avgVolume = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    return { nextMonth: Math.max(0, Math.round(last + (last - prev) * 0.6)), trend, avgVolume };
  }, [ticketTimeSeries]);

  // --- Consolidated predictions ---
  const predictions = useMemo((): Prediction[] => {
    const preds: Prediction[] = [];

    if (clvPrediction) {
      preds.push({
        label: 'Customer Lifetime Value',
        value: `R${clvPrediction.clv.toLocaleString()}`,
        confidence: Math.round(clvPrediction.retentionRate * 100),
        trend: clvPrediction.clv > clvPrediction.avgRevenue * 3 ? 'up' : 'stable',
        icon: <DollarSign className="h-4 w-4" />,
        color: 'hsl(var(--chart-revenue))',
        detail: `Avg revenue/customer: R${clvPrediction.avgRevenue.toLocaleString()}`,
      });
    }

    if (growthPrediction) {
      preds.push({
        label: 'Next Month New Customers',
        value: `~${growthPrediction.next3MonthPrediction}`,
        confidence: growthPrediction.confidence,
        trend: growthPrediction.trend,
        icon: <Users className="h-4 w-4" />,
        color: 'hsl(var(--chart-new))',
        detail: `Growth slope: ${growthPrediction.slope > 0 ? '+' : ''}${growthPrediction.slope}/mo`,
      });
    }

    if (revenueForecast) {
      preds.push({
        label: 'Next Quarter Revenue',
        value: `R${revenueForecast.forecast.toLocaleString()}`,
        confidence: revenueForecast.confidence,
        trend: revenueForecast.growth >= 0 ? 'up' : 'down',
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'hsl(var(--chart-forecast))',
        detail: `${revenueForecast.growth >= 0 ? '+' : ''}${revenueForecast.growth}% growth trend`,
      });
    }

    if (ticketPrediction) {
      preds.push({
        label: 'Next Month Tickets',
        value: `~${ticketPrediction.nextMonth}`,
        confidence: 60,
        trend: ticketPrediction.trend,
        icon: <Zap className="h-4 w-4" />,
        color: 'hsl(var(--chart-pending))',
        detail: `Avg monthly volume: ${ticketPrediction.avgVolume}`,
      });
    }

    return preds;
  }, [clvPrediction, growthPrediction, revenueForecast, ticketPrediction]);

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <ArrowUpRight className="h-3.5 w-3.5" />;
    if (trend === 'down') return <ArrowDownRight className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  const riskColor = (score: number) => {
    if (score >= 60) return 'hsl(var(--chart-churn))';
    if (score >= 30) return 'hsl(var(--chart-pending))';
    return 'hsl(var(--chart-existing))';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-sm text-muted-foreground">Generating predictions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Predictions Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" style={{ color: 'hsl(var(--chart-forecast))' }} />
            Predictive Insights
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            AI-driven forecasts based on your historical data patterns
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {predictions.map((pred) => (
              <div
                key={pred.label}
                className="relative p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg" style={{ background: `${pred.color}15`, color: pred.color }}>
                    {pred.icon}
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: pred.color }}>
                    <TrendIcon trend={pred.trend} />
                    {pred.trend === 'up' ? 'Rising' : pred.trend === 'down' ? 'Falling' : 'Stable'}
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{pred.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{pred.label}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Confidence</span>
                    <span>{pred.confidence}%</span>
                  </div>
                  <Progress value={pred.confidence} className="h-1.5" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">{pred.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Churn Risk Segments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" style={{ color: 'hsl(var(--chart-churn))' }} />
            Churn Risk Segmentation
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Customer segments ranked by predicted churn probability
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {churnRiskSegments.map((seg) => (
              <div key={seg.segment} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex-shrink-0 w-12 text-center">
                  <p className="text-lg font-bold" style={{ color: riskColor(seg.riskScore) }}>
                    {seg.riskScore}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Risk</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{seg.segment}</p>
                    <Badge variant="secondary" className="text-[10px]">{seg.count} customers</Badge>
                  </div>
                  <Progress
                    value={seg.riskScore}
                    className="h-1.5 mb-1.5"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {seg.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(PredictiveInsightsPanel);
