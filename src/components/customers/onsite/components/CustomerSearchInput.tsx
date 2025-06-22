
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CustomerSearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFocus: () => void;
  disabled?: boolean;
}

export const CustomerSearchInput = ({ 
  searchTerm, 
  onSearchChange, 
  onFocus, 
  disabled 
}: CustomerSearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search by name, email, or phone..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={onFocus}
        className="pl-10 border-2 border-gray-200 focus:border-green-500 rounded-lg"
        disabled={disabled}
      />
    </div>
  );
};
