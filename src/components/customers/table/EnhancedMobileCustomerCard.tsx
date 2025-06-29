
import React, { useState } from 'react';
import { Customer, CustomerStatus } from '@/types/customer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Loader2,
  MapPin,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusSelector from '../StatusSelector';
import TicketIndicator from '../TicketIndicator';
import { useVoiceCall } from '@/hooks/useVoiceCall';

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
  const { makeCall, isCalling } = useVoiceCall();
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const handleCall = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    if (customer.phone) {
      makeCall({ phoneNumber: customer.phone, customerId: customer.id });
    }
  };

  const handleEmail = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    if (customer.email) {
      window.location.href = `mailto:${customer.email}`;
    }
  };

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
    if (Math.abs(swipeDistance) > 100) {
      // Trigger quick action based on swipe direction
      if (swipeDistance > 100 && customer.phone) {
        handleCall({} as React.MouseEvent);
      } else if (swipeDistance < -100 && customer.email) {
        handleEmail({} as React.MouseEvent);
      }
    }
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
      {/* Swipe Action Indicators */}
      {Math.abs(swipeDistance) > 50 && (
        <div className="absolute inset-y-0 flex items-center justify-center w-16 bg-quikle-primary/10 z-0">
          {swipeDistance > 50 ? (
            <Phone className="h-6 w-6 text-quikle-primary" />
          ) : (
            <Mail className="h-6 w-6 text-quikle-primary" />
          )}
        </div>
      )}

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              aria-label={`Select customer ${customer.name}`}
              className="touch-target flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-quikle-charcoal truncate">
                {customer.name}
              </h3>
              <div className="mt-1">
                <StatusSelector
                  status={customer.status}
                  onChange={(status) => onStatusChange(customer.id, status)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} customer details`}
              className="touch-target h-10 w-10 p-0 hover:bg-quikle-crystal transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Contact Strip */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-quikle-silver/20">
          <div className="flex items-center gap-2">
            {customer.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCall}
                disabled={isCalling}
                className="touch-target h-10 px-4 bg-white hover:bg-quikle-crystal border-quikle-silver text-quikle-primary"
                aria-label={`Call ${customer.name}`}
              >
                {isCalling ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Phone className="h-4 w-4 mr-2" />
                )}
                Call
              </Button>
            )}
            
            {customer.email && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmail}
                className="touch-target h-10 px-4 bg-white hover:bg-quikle-crystal border-quikle-silver text-quikle-primary"
                aria-label={`Email ${customer.name}`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="touch-target h-10 w-10 p-0 hover:bg-quikle-crystal"
                aria-label="More actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-quikle-silver shadow-luxury">
              <DropdownMenuItem 
                onClick={() => onEdit(customer)}
                className="touch-target py-3 px-4 hover:bg-quikle-crystal cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-3" />
                Edit Customer
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onManageTickets(customer)}
                className="touch-target py-3 px-4 hover:bg-quikle-crystal cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 mr-3" />
                Manage Tickets
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(customer.id)}
                className="touch-target py-3 px-4 hover:bg-red-50 text-red-600 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-3" />
                Delete Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 relative z-10 animate-fade-in">
          <div className="space-y-4">
            {/* Contact Information */}
            <div className="bg-quikle-crystal/30 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-quikle-charcoal text-sm">Contact Details</h4>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-quikle-primary flex-shrink-0" />
                  <a 
                    href={`mailto:${customer.email}`}
                    className="text-quikle-charcoal hover:text-quikle-primary transition-colors touch-target block py-1"
                    aria-label={`Email ${customer.name} at ${customer.email}`}
                  >
                    {customer.email}
                  </a>
                </div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="h-4 w-4 text-quikle-primary flex-shrink-0" />
                  {customer.phone ? (
                    <button
                      onClick={handleCall}
                      disabled={isCalling}
                      className="text-quikle-charcoal hover:text-quikle-primary transition-colors touch-target py-1 text-left"
                      aria-label={`Call ${customer.name} at ${customer.phone}`}
                    >
                      {customer.phone}
                    </button>
                  ) : (
                    <span className="text-quikle-slate">No phone</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-quikle-primary flex-shrink-0" />
                  <span className="text-quikle-slate">Created {formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Tickets Section */}
            <div className="bg-white rounded-lg border border-quikle-silver/20 p-4">
              <h4 className="font-medium text-quikle-charcoal text-sm mb-3">Tickets & Activity</h4>
              <TicketIndicator
                tickets={customer.activeTickets || []}
                ticketCount={customer.ticketCount || 0}
                lastTicketDate={customer.lastTicketDate}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default EnhancedMobileCustomerCard;
