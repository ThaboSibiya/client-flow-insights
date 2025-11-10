import { useState } from 'react';
import DebtorsList from './DebtorsList';
import DebtorDetailPanel from './DebtorDetailPanel';
import { DebtorCustomer } from '@/hooks/useDebtorData';

interface DebtorsTabProps {
  debtors: DebtorCustomer[];
  onRefresh: () => void;
}

const DebtorsTab = ({ debtors, onRefresh }: DebtorsTabProps) => {
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorCustomer | null>(
    debtors.length > 0 ? debtors[0] : null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Debtors List */}
      <div className="lg:col-span-1">
        <DebtorsList
          debtors={debtors}
          selectedDebtor={selectedDebtor}
          onSelectDebtor={setSelectedDebtor}
        />
      </div>

      {/* Right: Debtor Details */}
      <div className="lg:col-span-2">
        {selectedDebtor ? (
          <DebtorDetailPanel debtor={selectedDebtor} onRefresh={onRefresh} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a debtor to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtorsTab;
