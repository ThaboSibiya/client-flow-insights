
import { Customer } from '@/types/customer';

export interface MonthlyActivityData {
  name: string;
  new: number;
  existing: number;
  pending: number;
  finalised: number;
}

export const generateMonthlyActivityData = (customers: Customer[]): MonthlyActivityData[] => {
  const data: MonthlyActivityData[] = [];
  const months = [];
  
  // Get the last 6 months (including current)
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push({
      month: date.getMonth(),
      year: date.getFullYear(),
      name: date.toLocaleString('default', { month: 'short' })
    });
  }
  
  // Count customers for each month
  months.forEach(({ month, year, name }) => {
    // Count new customers created this month
    const newCustomers = customers.filter(customer => {
      const created = customer.createdAt;
      return created.getMonth() === month && 
             created.getFullYear() === year && 
             customer.status === 'new';
    }).length;
    
    // Count existing customers updated this month
    const existingCustomers = customers.filter(customer => {
      const updated = customer.updatedAt;
      return updated.getMonth() === month && 
             updated.getFullYear() === year && 
             customer.status === 'existing';
    }).length;
    
    // Count pending customers updated this month
    const pendingCustomers = customers.filter(customer => {
      const updated = customer.updatedAt;
      return updated.getMonth() === month && 
             updated.getFullYear() === year && 
             customer.status === 'pending';
    }).length;
    
    // Count finalised customers updated this month
    const finalisedCustomers = customers.filter(customer => {
      const updated = customer.updatedAt;
      return updated.getMonth() === month && 
             updated.getFullYear() === year && 
             customer.status === 'finalised';
    }).length;
    
    data.push({
      name,
      new: newCustomers,
      existing: existingCustomers,
      pending: pendingCustomers,
      finalised: finalisedCustomers
    });
  });
  
  return data;
};
