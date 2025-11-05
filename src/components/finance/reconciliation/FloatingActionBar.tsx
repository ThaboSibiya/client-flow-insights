import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link2, AlertTriangle, Flag, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionBarProps {
  selectedInvoice: any | null;
  selectedPayment: any | null;
  onMatch: () => Promise<void>;
  onMarkPartial: () => Promise<void>;
  onFlagForReview: () => Promise<void>;
  onSaveReconciliation: () => Promise<void>;
  isProcessing: boolean;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  selectedInvoice,
  selectedPayment,
  onMatch,
  onMarkPartial,
  onFlagForReview,
  onSaveReconciliation,
  isProcessing,
}) => {
  const hasSelection = selectedInvoice || selectedPayment;
  const hasBothSelected = selectedInvoice && selectedPayment;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <Card className="shadow-2xl border-2 border-quikle-primary/20 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 p-4">
          {/* Status indicator */}
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

          <div className="h-8 w-px bg-gray-300" />

          {/* Action buttons */}
          <Button
            onClick={onMatch}
            disabled={!hasBothSelected || isProcessing}
            className="bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:shadow-lg transition-shadow"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Match Selected
          </Button>

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
