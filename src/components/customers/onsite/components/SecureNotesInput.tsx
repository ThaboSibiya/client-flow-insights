
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { sanitizeInput } from '@/services/securityService';

interface SecureNotesInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SecureNotesInput = ({ value, onChange }: SecureNotesInputProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value, 1000);
    onChange(sanitizedValue);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">Job Notes</label>
      <Textarea
        placeholder="Add notes about the completed work..."
        value={value}
        onChange={handleInputChange}
        rows={3}
        className="border-2 border-gray-200 focus:border-green-500 resize-none"
        maxLength={1000}
      />
      <div className="text-xs text-gray-500 text-right">
        {value.length}/1000 characters
      </div>
    </div>
  );
};
