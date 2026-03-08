import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Clock,
  Target,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useRevenueOptimization } from '@/hooks/useRevenueOptimization';
import { financeEventBus, FINANCE_EVENTS } from '@/stores/financeStore';

const CompactInsightsPanel: React.FC = () => {
  const {
    isProcessing,
    isLoading,
    upsellOpportunities,
    revenueMetrics,
    processOverdueInvoices,
    loadUpsellOpportunities,
  } = useRevenueOptimization();

  const handleProcessOverdue = async () => {
    await processOverdueInvoices();
    // Notify Finance page to refresh
    financeEventBus.emit(FINANCE_EVENTS.INVOICE_UPDATED);
    financeEventBus.emit(FINANCE_EVENTS.GLOBAL_REFRESH);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact KPI Grid */}
      {revenueMetrics && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              R{revenueMetrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              R{revenueMetrics.pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs text-muted-foreground">Overdue</span>
            </div>
            <p className="text-lg font-semibold text-destructive">
              R{revenueMetrics.overdueAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            {revenueMetrics.overdueInvoices > 0 && (
              <span className="text-xs text-muted-foreground">
                {revenueMetrics.overdueInvoices} invoice{revenueMetrics.overdueInvoices !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Collection</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {revenueMetrics.paymentCollectionRate.toFixed(0)}%
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {revenueMetrics && revenueMetrics.overdueInvoices > 0 && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {revenueMetrics.overdueInvoices} Overdue Invoice{revenueMetrics.overdueInvoices !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                R{revenueMetrics.overdueAmount.toFixed(2)} outstanding
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleProcessOverdue}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              )}
              Process
            </Button>
          </div>
        </div>
      )}

      {/* Performance Summary */}
      {revenueMetrics && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Performance</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quote acceptance</span>
              <span className="font-medium text-foreground">
                {revenueMetrics.quoteAcceptanceRate.toFixed(0)}%
                <span className="text-muted-foreground font-normal ml-1">
                  ({revenueMetrics.acceptedQuotes}/{revenueMetrics.totalQuotes})
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Invoices paid</span>
              <span className="font-medium text-foreground">
                {revenueMetrics.paymentCollectionRate.toFixed(0)}%
                <span className="text-muted-foreground font-normal ml-1">
                  ({revenueMetrics.paidInvoices}/{revenueMetrics.totalInvoices})
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Upsell Opportunities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Opportunities</h4>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadUpsellOpportunities}
            disabled={isProcessing}
            className="h-7 px-2"
          >
            {isProcessing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>

        {upsellOpportunities.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No opportunities found yet.
          </p>
        ) : (
          <div className="space-y-2">
            {upsellOpportunities.slice(0, 3).map((opp) => (
              <div
                key={opp.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge
                      variant={
                        opp.priority === 'high'
                          ? 'destructive'
                          : opp.priority === 'medium'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-[10px] px-1.5 py-0"
                    >
                      {opp.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground truncate">{opp.recommendation}</p>
                  <p className="text-[10px] text-muted-foreground">
                    R{opp.potentialValue.toFixed(0)} potential
                  </p>
                </div>
                <Target className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactInsightsPanel;
