
import { Customer } from '@/context/CRMContext';

export interface ReportData {
  name: string;
  new: number;
  existing: number;
  pending: number;
  finalised: number;
  conversionRate: number;
}

export interface ReportSummary {
  totalNew: number;
  totalFinalised: number;
  overallConversion: number;
}

export const generateReportData = (customers: Customer[], timeframe: 'monthly' | 'yearly'): ReportData[] => {
  const data: ReportData[] = [];
  const today = new Date();
  
  if (timeframe === 'monthly') {
    // Generate data for the past 12 months
    for (let i = 11; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      // Count customers by status for this month
      const newCustomers = customers.filter(c => 
        c.status === 'new' && 
        c.createdAt.getMonth() === month.getMonth() && 
        c.createdAt.getFullYear() === month.getFullYear()
      ).length;
      
      const existingCustomers = customers.filter(c => 
        c.status === 'existing' && 
        c.updatedAt.getMonth() === month.getMonth() && 
        c.updatedAt.getFullYear() === month.getFullYear()
      ).length;
      
      const pendingCustomers = customers.filter(c => 
        c.status === 'pending' && 
        c.updatedAt.getMonth() === month.getMonth() && 
        c.updatedAt.getFullYear() === month.getFullYear()
      ).length;
      
      const finalisedCustomers = customers.filter(c => 
        c.status === 'finalised' && 
        c.updatedAt.getMonth() === month.getMonth() && 
        c.updatedAt.getFullYear() === month.getFullYear()
      ).length;
      
      // Calculate conversion rate (finalised / new) * 100, or 0 if no new customers
      const conversionRate = newCustomers > 0 
        ? Math.round((finalisedCustomers / newCustomers) * 100) 
        : 0;
      
      data.push({
        name: monthName,
        new: newCustomers,
        existing: existingCustomers,
        pending: pendingCustomers,
        finalised: finalisedCustomers,
        conversionRate: conversionRate
      });
    }
  } else {
    // Generate data for the past 5 years
    for (let i = 4; i >= 0; i--) {
      const year = today.getFullYear() - i;
      
      // Count customers by status for this year
      const newCustomers = customers.filter(c => 
        c.status === 'new' && 
        c.createdAt.getFullYear() === year
      ).length;
      
      const existingCustomers = customers.filter(c => 
        c.status === 'existing' && 
        c.updatedAt.getFullYear() === year
      ).length;
      
      const pendingCustomers = customers.filter(c => 
        c.status === 'pending' && 
        c.updatedAt.getFullYear() === year
      ).length;
      
      const finalisedCustomers = customers.filter(c => 
        c.status === 'finalised' && 
        c.updatedAt.getFullYear() === year
      ).length;
      
      // Calculate conversion rate
      const conversionRate = newCustomers > 0 
        ? Math.round((finalisedCustomers / newCustomers) * 100) 
        : 0;
      
      data.push({
        name: year.toString(),
        new: newCustomers,
        existing: existingCustomers,
        pending: pendingCustomers,
        finalised: finalisedCustomers,
        conversionRate: conversionRate
      });
    }
  }
  
  return data;
};

export const calculateSummary = (reportData: ReportData[]): ReportSummary => {
  const totalNew = reportData.reduce((sum, item) => sum + item.new, 0);
  const totalFinalised = reportData.reduce((sum, item) => sum + item.finalised, 0);
  const overallConversion = totalNew > 0 
    ? Math.round((totalFinalised / totalNew) * 100) 
    : 0;
  
  return {
    totalNew,
    totalFinalised,
    overallConversion
  };
};
