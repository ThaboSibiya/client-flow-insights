
import React, { useState } from 'react';
import { Customer, CustomerStatus } from '@/types/customer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import MobileCustomerCardHeader from './MobileCustomerCardHeader';
import MobileCustomerQuickActions from './MobileCustomerQuickActions';
import MobileCustomerDetails from './MobileCustomerDetails';

interface EnhancedMobileCustomerCardProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusChange: (customerId: string, status: CustomerStatus) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onManageTickets: (customer: Customer) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const EnhancedMobileCustomerCard = ({
  customer,
  isSelected,
  onSelect,
  onStatusChange,
  onEdit,
  onDelete,
  onManageTickets,
  isExpanded,
  onToggleExpanded,
}: EnhancedMobileCustomerCardProps) => {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = touchStart.x - currentX;
    const diffY = touchStart.y - currentY;
    
    // Only handle horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setSwipeDistance(-diffX);
    }
  };

  const handleTouchEnd = () => {
    setSwipeDistance(0);
    setTouchStart(null);
  };

  return (
    <Card 
      className={`relative transition-all duration-200 hover:shadow-md touch-target ${
        isSelected ? 'ring-2 ring-quikle-primary bg-quikle-crystal/50' : ''
      } ${isExpanded ? 'shadow-lg' : 'shadow-sm'}`}
      style={{ transform: `translateX(${Math.min(Math.max(swipeDistance, -150), 150)}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="listitem"
      aria-label={`Customer card for ${customer.name}`}
    >
      <CardHeader className="pb-3 relative z-10">
        <MobileCustomerCardHeader
          customer={customer}
          isSelected={isSelected}
          onSelect={onSelect}
          onStatusChange={onStatusChange}
          isExpanded={isExpanded}
          onToggleExpanded={onToggleExpanded}
        />
        
        <MobileCustomerQuickActions
          customer={customer}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageTickets={onManageTickets}
        />
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 relative z-10">
          <MobileCustomerDetails customer={customer} />
        </CardContent>
      )}
    </Card>
  );
};

export default EnhancedMobileCustomerCard;
