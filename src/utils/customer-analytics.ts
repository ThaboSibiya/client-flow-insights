
import { Customer } from '@/types/customer';

export interface ReportData {
  month: string;
  new: number;
  existing: number;
  pending: number;
  finalised: number;
  conversionRate: number;
  name: string; // Added for compatibility
}

export interface ReportSummary {
  totalNew: number;
  totalExisting: number;
  totalPending: number;
  totalFinalised: number;
  overallConversion: number;
}

export interface Summary {
  totalCustomers: number;
  newCustomers: number;
  finalisedCustomers: number;
  averageConversionRate: number;
}

export const generateReportData = (customers: Customer[], timeframe: 'monthly' | 'yearly'): ReportData[] => {
  const monthlyData: { [key: string]: { new: number; existing: number; pending: number; finalised: number } } = {};
  
  customers.forEach(customer => {
    const date = new Date(customer.createdAt);
    const monthKey = timeframe === 'monthly' 
      ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : date.getFullYear().toString();
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { new: 0, existing: 0, pending: 0, finalised: 0 };
    }
    
    if (customer.status === 'new') {
      monthlyData[monthKey].new++;
    } else if (customer.status === 'existing') {
      monthlyData[monthKey].existing++;
    } else if (customer.status === 'pending') {
      monthlyData[monthKey].pending++;
    } else if (customer.status === 'finalised') {
      monthlyData[monthKey].finalised++;
    }
  });
  
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    name: month, // Added for compatibility
    new: data.new,
    existing: data.existing,
    pending: data.pending,
    finalised: data.finalised,
    conversionRate: data.new > 0 ? (data.finalised / data.new) * 100 : 0
  }));
};

export const calculateSummary = (reportData: ReportData[]): Summary => {
  const totalNew = reportData.reduce((sum, item) => sum + item.new, 0);
  const totalFinalised = reportData.reduce((sum, item) => sum + item.finalised, 0);
  const averageConversionRate = reportData.length > 0 
    ? reportData.reduce((sum, item) => sum + item.conversionRate, 0) / reportData.length
    : 0;
  
  return {
    totalCustomers: totalNew + totalFinalised,
    newCustomers: totalNew,
    finalisedCustomers: totalFinalised,
    averageConversionRate
  };
};

export const calculateReportSummary = (reportData: ReportData[]): ReportSummary => {
  const totalNew = reportData.reduce((sum, item) => sum + item.new, 0);
  const totalExisting = reportData.reduce((sum, item) => sum + item.existing, 0);
  const totalPending = reportData.reduce((sum, item) => sum + item.pending, 0);
  const totalFinalised = reportData.reduce((sum, item) => sum + item.finalised, 0);
  const overallConversion = totalNew > 0 ? (totalFinalised / totalNew) * 100 : 0;
  
  return {
    totalNew,
    totalExisting,
    totalPending,
    totalFinalised,
    overallConversion
  };
};
