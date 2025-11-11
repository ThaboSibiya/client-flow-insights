import { DebtorCustomer } from '@/hooks/useDebtorData';

export interface AgingBucket {
  range: string;
  count: number;
  total: number;
  customers: DebtorCustomer[];
}

export interface FinanceReport {
  generatedAt: string;
  summary: {
    totalDebtors: number;
    totalOverdue: number;
    highRiskCount: number;
    criticalCount: number;
    averageDaysOverdue: number;
  };
  agingBuckets: AgingBucket[];
  highRiskAccounts: DebtorCustomer[];
  criticalAccounts: DebtorCustomer[];
}

export const generateFinanceReport = (debtors: DebtorCustomer[]): FinanceReport => {
  // Calculate aging buckets
  const current = debtors.filter(d => (d.days_overdue || 0) <= 0);
  const days1to30 = debtors.filter(d => (d.days_overdue || 0) > 0 && (d.days_overdue || 0) <= 30);
  const days31to60 = debtors.filter(d => (d.days_overdue || 0) > 30 && (d.days_overdue || 0) <= 60);
  const days61to90 = debtors.filter(d => (d.days_overdue || 0) > 60 && (d.days_overdue || 0) <= 90);
  const days90plus = debtors.filter(d => (d.days_overdue || 0) > 90);

  const agingBuckets: AgingBucket[] = [
    {
      range: 'Current',
      count: current.length,
      total: current.reduce((sum, d) => sum + (d.total_overdue || 0), 0),
      customers: current,
    },
    {
      range: '1-30 Days',
      count: days1to30.length,
      total: days1to30.reduce((sum, d) => sum + (d.total_overdue || 0), 0),
      customers: days1to30,
    },
    {
      range: '31-60 Days',
      count: days31to60.length,
      total: days31to60.reduce((sum, d) => sum + (d.total_overdue || 0), 0),
      customers: days31to60,
    },
    {
      range: '61-90 Days',
      count: days61to90.length,
      total: days61to90.reduce((sum, d) => sum + (d.total_overdue || 0), 0),
      customers: days61to90,
    },
    {
      range: '90+ Days',
      count: days90plus.length,
      total: days90plus.reduce((sum, d) => sum + (d.total_overdue || 0), 0),
      customers: days90plus,
    },
  ];

  // High risk and critical accounts
  const highRiskAccounts = debtors.filter(d => d.finance_summary?.risk_rating === 'high');
  const criticalAccounts = debtors.filter(d => 
    d.finance_summary?.risk_rating === 'critical' || 
    d.finance_summary?.account_status === 'collection'
  );

  // Calculate average days overdue
  const totalDaysOverdue = debtors.reduce((sum, d) => sum + (d.days_overdue || 0), 0);
  const averageDaysOverdue = debtors.length > 0 ? Math.round(totalDaysOverdue / debtors.length) : 0;

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalDebtors: debtors.length,
      totalOverdue: debtors.reduce((sum, d) => sum + (d.total_overdue || 0), 0),
      highRiskCount: highRiskAccounts.length,
      criticalCount: criticalAccounts.length,
      averageDaysOverdue,
    },
    agingBuckets,
    highRiskAccounts,
    criticalAccounts,
  };
};

export const exportReportAsCSV = (report: FinanceReport): string => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  
  let csv = 'Debtor Aging and Collection Report\n';
  csv += `Generated: ${new Date(report.generatedAt).toLocaleString()}\n\n`;
  
  // Summary
  csv += 'SUMMARY\n';
  csv += 'Metric,Value\n';
  csv += `Total Debtors,${report.summary.totalDebtors}\n`;
  csv += `Total Outstanding,${formatCurrency(report.summary.totalOverdue)}\n`;
  csv += `High Risk Accounts,${report.summary.highRiskCount}\n`;
  csv += `Critical/Collection,${report.summary.criticalCount}\n`;
  csv += `Average Days Overdue,${report.summary.averageDaysOverdue}\n\n`;
  
  // Aging Analysis
  csv += 'AGING ANALYSIS\n';
  csv += 'Age Range,Count,Total Amount\n';
  report.agingBuckets.forEach(bucket => {
    csv += `${bucket.range},${bucket.count},${formatCurrency(bucket.total)}\n`;
  });
  csv += '\n';
  
  // High Risk Accounts
  csv += 'HIGH RISK ACCOUNTS\n';
  csv += 'Customer,Email,Outstanding,Days Overdue,Risk Rating,Status\n';
  report.highRiskAccounts.forEach(d => {
    csv += `"${d.name}","${d.email}",${formatCurrency(d.total_overdue || 0)},${d.days_overdue || 0},${d.finance_summary?.risk_rating || 'N/A'},${d.finance_summary?.account_status || 'N/A'}\n`;
  });
  csv += '\n';
  
  // Critical Accounts
  csv += 'CRITICAL/COLLECTION ACCOUNTS\n';
  csv += 'Customer,Email,Outstanding,Days Overdue,Risk Rating,Status\n';
  report.criticalAccounts.forEach(d => {
    csv += `"${d.name}","${d.email}",${formatCurrency(d.total_overdue || 0)},${d.days_overdue || 0},${d.finance_summary?.risk_rating || 'N/A'},${d.finance_summary?.account_status || 'N/A'}\n`;
  });
  
  return csv;
};

export const downloadReport = (report: FinanceReport) => {
  const csv = exportReportAsCSV(report);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fileName = `debtor_report_${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
