
import { Customer } from '@/types/customer';

export interface ReportData {
  month: string;
  new: number;
  finalised: number;
  conversionRate: number;
}

export interface Summary {
  totalCustomers: number;
  newCustomers: number;
  finalisedCustomers: number;
  averageConversionRate: number;
}

export const generateReportData = (customers: Customer[], timeframe: 'monthly' | 'yearly'): ReportData[] => {
  const monthlyData: { [key: string]: { new: number; finalised: number } } = {};
  
  customers.forEach(customer => {
    const date = new Date(customer.createdAt);
    const monthKey = timeframe === 'monthly' 
      ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : date.getFullYear().toString();
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { new: 0, finalised: 0 };
    }
    
    if (customer.status === 'new') {
      monthlyData[monthKey].new++;
    } else if (customer.status === 'finalised') {
      monthlyData[monthKey].finalised++;
    }
  });
  
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    new: data.new,
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
