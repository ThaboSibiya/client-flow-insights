import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, AlertCircle } from 'lucide-react';
import { DebtorCustomer } from '@/hooks/useDebtorData';

interface DebtorsListProps {
  debtors: DebtorCustomer[];
  selectedDebtor: DebtorCustomer | null;
  onSelectDebtor: (debtor: DebtorCustomer) => void;
}

const DebtorsList = ({ debtors, selectedDebtor, onSelectDebtor }: DebtorsListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[risk as keyof typeof colors] || colors.low;
  };

  const filteredDebtors = debtors.filter(debtor => {
    const matchesSearch = debtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debtor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || debtor.finance_summary?.risk_rating === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search debtors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Debtor List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredDebtors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No debtors found
              </div>
            ) : (
              filteredDebtors.map((debtor) => (
                <div
                  key={debtor.id}
                  onClick={() => onSelectDebtor(debtor)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                    selectedDebtor?.id === debtor.id ? 'bg-accent border-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{debtor.name}</h4>
                      <p className="text-xs text-muted-foreground">{debtor.email}</p>
                    </div>
                    {debtor.finance_summary && (
                      <Badge className={getRiskBadge(debtor.finance_summary.risk_rating)}>
                        {debtor.finance_summary.risk_rating.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-semibold">
                        {formatCurrency(debtor.total_overdue || 0)}
                      </span>
                    </div>
                    {debtor.days_overdue && debtor.days_overdue > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {debtor.days_overdue} days overdue
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtorsList;
