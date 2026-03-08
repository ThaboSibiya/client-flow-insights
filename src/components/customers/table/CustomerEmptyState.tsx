
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

const CustomerEmptyState = ({ hasFilters = false, onClearFilters }: CustomerEmptyStateProps) => {
  const navigate = useNavigate();

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No matches found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          Try adjusting your search or filter criteria
        </p>
        {onClearFilters && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearFilters}
          >
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">No clients yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-5">
        Get started by adding your first client to manage their information and tickets.
      </p>
      <Button 
        onClick={() => navigate('/onboarding')}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add First Client
      </Button>
    </div>
  );
};

export default CustomerEmptyState;
