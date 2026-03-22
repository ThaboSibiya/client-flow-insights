
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ChangeReasonInputProps {
  value: string;
  onChange: (value: string) => void;
  hasChanges: boolean;
}

const ChangeReasonInput: React.FC<ChangeReasonInputProps> = ({
  value,
  onChange,
  hasChanges
}) => {
  if (!hasChanges) return null;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        Reason for Changes (Optional)
      </Label>
      <Textarea
        placeholder="Describe why these privilege changes are being made..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default ChangeReasonInput;
