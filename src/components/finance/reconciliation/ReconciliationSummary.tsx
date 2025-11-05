import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export interface ReconciliationSummaryData {
  totalInvoices: number;
  totalPayments: number;
  matched: number;
  unmatched: number;
  discrepancies: number;
  totalInvoiceAmount: number;
  totalPaymentAmount: number;
}

interface ReconciliationSummaryProps {
  summary: ReconciliationSummaryData;
}

const ReconciliationSummary: React.FC<ReconciliationSummaryProps> = ({ summary }) => {
  const summaryCards = [
    {
      title: "Total Invoices",
      value: summary.totalInvoices,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      subtitle: `$${summary.totalInvoiceAmount.toLocaleString()}`
    },
    {
      title: "Total Payments",
      value: summary.totalPayments,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      subtitle: `$${summary.totalPaymentAmount.toLocaleString()}`
    },
    {
      title: "Matched",
      value: summary.matched,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      subtitle: "Successfully reconciled"
    },
    {
      title: "Unmatched",
      value: summary.unmatched,
      icon: XCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      subtitle: "Needs attention"
    },
    {
      title: "Discrepancies",
      value: summary.discrepancies,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      subtitle: "Amount mismatches"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border-quikle-silver/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-quikle-charcoal/70">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-quikle-charcoal">{card.value}</div>
              <p className="text-xs text-quikle-slate mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ReconciliationSummary;
