import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { DebtorCustomer } from '@/hooks/useDebtorData';
import DebtorCard from './DebtorCard';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PriorityDebtorListProps {
  debtors: DebtorCustomer[];
  selectedDebtor: DebtorCustomer | null;
  onSelectDebtor: (debtor: DebtorCustomer) => void;
  onQuickAction?: (debtor: DebtorCustomer, action: 'email' | 'call' | 'view') => void;
}

type FilterType = 'critical' | 'high' | 'medium' | 'low';

const PriorityDebtorList = ({ 
  debtors, 
  selectedDebtor, 
  onSelectDebtor,
  onQuickAction
}: PriorityDebtorListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);

  // Group and sort debtors by urgency
  const groupedDebtors = useMemo(() => {
    const filtered = debtors.filter(debtor => {
      const matchesSearch = 
        debtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debtor.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const risk = debtor.finance_summary?.risk_rating || 'low';
      const matchesFilter = activeFilters.length === 0 || activeFilters.includes(risk as FilterType);
      
      return matchesSearch && matchesFilter;
    });

    // Sort by urgency: critical > high > medium > low, then by days overdue
    const sorted = [...filtered].sort((a, b) => {
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const riskA = a.finance_summary?.risk_rating || 'low';
      const riskB = b.finance_summary?.risk_rating || 'low';
      
      if (riskOrder[riskA as keyof typeof riskOrder] !== riskOrder[riskB as keyof typeof riskOrder]) {
        return riskOrder[riskA as keyof typeof riskOrder] - riskOrder[riskB as keyof typeof riskOrder];
      }
      
      return (b.days_overdue || 0) - (a.days_overdue || 0);
    });

    // Group by priority section
    const critical = sorted.filter(d => d.finance_summary?.risk_rating === 'critical');
    const high = sorted.filter(d => d.finance_summary?.risk_rating === 'high');
    const other = sorted.filter(d => 
      d.finance_summary?.risk_rating !== 'critical' && 
      d.finance_summary?.risk_rating !== 'high'
    );

    return { critical, high, other, total: sorted.length };
  }, [debtors, searchTerm, activeFilters]);

  const toggleFilter = (filter: FilterType) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="h-full flex flex-col bg-card border-r">
      {/* Search & Filters */}
      <div className="p-3 border-b space-y-2 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search debtors... (⌘K)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {groupedDebtors.total} debtor{groupedDebtors.total !== 1 ? 's' : ''}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                Filter
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={activeFilters.includes('critical')}
                onCheckedChange={() => toggleFilter('critical')}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  Critical
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.includes('high')}
                onCheckedChange={() => toggleFilter('high')}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  High Risk
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.includes('medium')}
                onCheckedChange={() => toggleFilter('medium')}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Medium Risk
                </span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.includes('low')}
                onCheckedChange={() => toggleFilter('low')}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Low Risk
                </span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Priority Groups */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {/* Critical Section */}
          {groupedDebtors.critical.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                </span>
                <span className="text-xs font-semibold text-destructive uppercase tracking-wide">
                  Critical ({groupedDebtors.critical.length})
                </span>
              </div>
              <div className="space-y-1">
                {groupedDebtors.critical.map(debtor => (
                  <DebtorCard
                    key={debtor.id}
                    debtor={debtor}
                    isSelected={selectedDebtor?.id === debtor.id}
                    onClick={() => onSelectDebtor(debtor)}
                    onQuickAction={(action) => onQuickAction?.(debtor, action)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* High Risk Section */}
          {groupedDebtors.high.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                  High Risk ({groupedDebtors.high.length})
                </span>
              </div>
              <div className="space-y-1">
                {groupedDebtors.high.map(debtor => (
                  <DebtorCard
                    key={debtor.id}
                    debtor={debtor}
                    isSelected={selectedDebtor?.id === debtor.id}
                    onClick={() => onSelectDebtor(debtor)}
                    onQuickAction={(action) => onQuickAction?.(debtor, action)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Debtors */}
          {groupedDebtors.other.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground"></span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Follow-up ({groupedDebtors.other.length})
                </span>
              </div>
              <div className="space-y-1">
                {groupedDebtors.other.map(debtor => (
                  <DebtorCard
                    key={debtor.id}
                    debtor={debtor}
                    isSelected={selectedDebtor?.id === debtor.id}
                    onClick={() => onSelectDebtor(debtor)}
                    onQuickAction={(action) => onQuickAction?.(debtor, action)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {groupedDebtors.total === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No debtors found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchTerm ? 'Try a different search term' : 'All accounts are in good standing'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PriorityDebtorList;
