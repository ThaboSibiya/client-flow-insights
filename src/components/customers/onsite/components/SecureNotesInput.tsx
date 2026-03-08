import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { sanitizeInput } from '@/utils/securityUtils';

interface SecureNotesInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export const SecureNotesInput = ({ 
  value, 
  onChange, 
  label = 'Notes',
  placeholder = 'Add notes about the completed work...',
  rows = 2
}: SecureNotesInputProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value, 1000);
    onChange(sanitizedValue);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        rows={rows}
        className="resize-none"
        maxLength={1000}
      />
      <div className="text-[11px] text-muted-foreground text-right">
        {value.length}/1000
      </div>
    </div>
  );
};
