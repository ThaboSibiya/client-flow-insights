
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const NotesInput = ({ value, onChange }: NotesInputProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">Job Notes</label>
      <Textarea
        placeholder="Add notes about the completed work..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="border-2 border-gray-200 focus:border-green-500 resize-none"
      />
    </div>
  );
};
