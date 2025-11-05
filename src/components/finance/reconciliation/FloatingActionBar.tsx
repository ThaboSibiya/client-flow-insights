import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link2, AlertTriangle, Flag, Save, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FloatingActionBarProps {
  selectedInvoice: any | null;
  selectedPayment: any | null;
  selectedInvoicesCount: number;
  selectedPaymentsCount: number;
  batchMode: boolean;
  onMatch: () => Promise<void>;
  onBatchMatch: () => Promise<void>;
  onMarkPartial: () => Promise<void>;
  onFlagForReview: () => Promise<void>;
  onSaveReconciliation: () => Promise<void>;
  onToggleBatchMode: () => void;
  isProcessing: boolean;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  selectedInvoice,
  selectedPayment,
  selectedInvoicesCount,
  selectedPaymentsCount,
  batchMode,
  onMatch,
  onBatchMatch,
  onMarkPartial,
  onFlagForReview,
  onSaveReconciliation,
  onToggleBatchMode,
  isProcessing,
}) => {
  const hasSelection = selectedInvoice || selectedPayment;
  const hasBothSelected = selectedInvoice && selectedPayment;
  const hasBatchSelection = selectedInvoicesCount > 0 || selectedPaymentsCount > 0;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <Card className="shadow-2xl border-2 border-quikle-primary/20 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 p-4">
          {/* Batch Mode Toggle */}
          <Button
            onClick={onToggleBatchMode}
            variant={batchMode ? "default" : "outline"}
            size="sm"
            className={cn(
              "transition-all",
              batchMode && "bg-purple-600 hover:bg-purple-700"
            )}
          >
            <Layers className="h-4 w-4 mr-2" />
            {batchMode ? "Exit Batch" : "Batch Mode"}
          </Button>

          <div className="h-8 w-px bg-gray-300" />

          {/* Status indicator */}
          {batchMode ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {selectedInvoicesCount} Invoices
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {selectedPaymentsCount} Payments
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <div className={cn(
                "w-2 h-2 rounded-full",
                hasBothSelected ? "bg-green-500 animate-pulse" : 
                hasSelection ? "bg-yellow-500" : "bg-gray-300"
              )} />
              <span className="text-sm font-medium text-quikle-charcoal">
                {hasBothSelected 
                  ? "Ready to Match" 
                  : hasSelection 
                    ? "Select Both" 
                    : "No Selection"}
              </span>
            </div>
          )}

          <div className="h-8 w-px bg-gray-300" />

          {/* Action buttons */}
          {batchMode ? (
            <Button
              onClick={onBatchMatch}
              disabled={selectedInvoicesCount === 0 || selectedPaymentsCount === 0 || isProcessing}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg transition-shadow"
            >
              <Layers className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : `Match ${Math.min(selectedInvoicesCount, selectedPaymentsCount)} Pairs`}
            </Button>
          ) : (
            <Button
              onClick={onMatch}
              disabled={!hasBothSelected || isProcessing}
              className="bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:shadow-lg transition-shadow"
            >
              <Link2 className="h-4 w-4 mr-2" />
              Match Selected
            </Button>
          )}

          {!batchMode && (
            <>
              <Button
                onClick={onMarkPartial}
                disabled={!selectedInvoice || isProcessing}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark as Partial
              </Button>

              <Button
                onClick={onFlagForReview}
                disabled={!hasSelection || isProcessing}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <Flag className="h-4 w-4 mr-2" />
                Flag for Review
              </Button>
            </>
          )}

          <div className="h-8 w-px bg-gray-300" />

          <Button
            onClick={onSaveReconciliation}
            disabled={isProcessing}
            variant="outline"
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Reconciliation
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FloatingActionBar;
