
interface Customer {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface ChartData {
  month: string;
  customers: number;
}

export const generateMonthlyActivityData = (customers: Customer[]): ChartData[] => {
  const monthlyData: { [key: string]: number } = {};
  
  customers.forEach(customer => {
    const date = new Date(customer.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
  });

  // Generate last 6 months
  const result: ChartData[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    result.push({
      month: monthName,
      customers: monthlyData[monthKey] || 0
    });
  }

  return result;
};
