
// Optimized date utilities with tree-shaking friendly imports
import { format } from 'date-fns/format';
import { startOfDay } from 'date-fns/startOfDay';
import { endOfDay } from 'date-fns/endOfDay';
import { subDays } from 'date-fns/subDays';
import { startOfMonth } from 'date-fns/startOfMonth';
import { startOfQuarter } from 'date-fns/startOfQuarter';

export const formatDate = (date: Date, formatString: string = 'MMM dd') => {
  return format(date, formatString);
};

export const getDateRange = (range: string) => {
  const now = new Date();
  
  switch (range) {
    case 'today':
      return { 
        start: startOfDay(now), 
        end: endOfDay(now) 
      };
    case 'week':
      return { 
        start: subDays(now, 7), 
        end: now 
      };
    case 'month':
      return { 
        start: startOfMonth(now), 
        end: now 
      };
    case 'quarter':
      return { 
        start: startOfQuarter(now), 
        end: now 
      };
    default:
      return { start: null, end: null };
  }
};

export const isValidDateRange = (start: Date | null, end: Date | null): boolean => {
  if (!start || !end) return true;
  return start <= end;
};
