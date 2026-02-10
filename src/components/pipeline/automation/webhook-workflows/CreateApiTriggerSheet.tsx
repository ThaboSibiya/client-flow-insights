
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Webhook } from 'lucide-react';
import { NewApiTrigger } from '@/hooks/useApiTriggers';

interface CreateApiTriggerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTrigger: (trigger: NewApiTrigger) => Promise<boolean>;
}

const CreateApiTriggerSheet: React.FC<CreateApiTriggerSheetProps> = ({
  open,
  onOpenChange,
  onCreateTrigger,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    setIsSubmitting(true);
    const success = await onCreateTrigger({
      name,
      method: 'POST',
      auth_type: 'bearer',
      description: description || undefined,
    });
    setIsSubmitting(false);

    if (success) {
      setName('');
      setDescription('');
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Webhook className="h-4 w-4 text-primary" />
            </div>
            <div>
              <SheetTitle>Create API Endpoint</SheetTitle>
              <SheetDescription>
                Generate a unique URL for external apps to send data to your CRM.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5 mt-6">
          <div className="space-y-2">
            <Label htmlFor="trigger-name">Name</Label>
            <Input
              id="trigger-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Lead from Website"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger-desc">Description (optional)</Label>
            <Textarea
              id="trigger-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What triggers this endpoint?"
              rows={3}
            />
          </div>

          <div className="rounded-md border border-dashed p-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">How it works</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>A unique URL is generated automatically</li>
              <li>Copy the URL and paste it in your external app</li>
              <li>Incoming requests are logged and can trigger workflows</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreate}
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Endpoint'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateApiTriggerSheet;
