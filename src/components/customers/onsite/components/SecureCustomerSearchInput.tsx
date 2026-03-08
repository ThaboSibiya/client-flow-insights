import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { sanitizeInput } from '@/utils/securityUtils';

interface SecureCustomerSearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFocus: () => void;
  disabled?: boolean;
}

export const SecureCustomerSearchInput = ({ 
  searchTerm, 
  onSearchChange, 
  onFocus, 
  disabled 
}: SecureCustomerSearchInputProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value, 100);
    onSearchChange(sanitizedValue);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={disabled ? "No customers available" : "Search customers..."}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={onFocus}
        disabled={disabled}
        className="pl-10"
        maxLength={100}
        autoComplete="off"
      />
    </div>
  );
};
