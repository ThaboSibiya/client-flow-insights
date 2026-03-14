import React, { useState, useCallback } from 'react';
import { Building2, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWorkspace } from '@/context/WorkspaceContext';

interface WorkspaceOnboardingProps {
  open: boolean;
  onComplete: () => void;
}

const WorkspaceOnboarding: React.FC<WorkspaceOnboardingProps> = ({ open, onComplete }) => {
  const { createWorkspace, refetchWorkspaces } = useWorkspace();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateWorkspace = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const ws = await createWorkspace(name.trim(), industry.trim() || undefined);
      if (ws) {
        await refetchWorkspaces();
        onComplete();
      } else {
        setError('Failed to create workspace. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name, industry, createWorkspace, refetchWorkspaces, onComplete]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <Building2 className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl">Welcome! Let's set up your business</DialogTitle>
          <DialogDescription>
            Create a workspace to organize your team, customers, and operations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="onboard-name">Business Name</Label>
            <Input
              id="onboard-name"
              placeholder="e.g. Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !saving && handleCreateWorkspace()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="onboard-industry">Industry (optional)</Label>
            <Input
              id="onboard-industry"
              placeholder="e.g. Technology, Retail, HVAC"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !saving && handleCreateWorkspace()}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <Button
          onClick={handleCreateWorkspace}
          disabled={!name.trim() || saving}
          className="w-full"
        >
          {saving ? 'Creating...' : 'Create Workspace'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You need at least one workspace to get started.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceOnboarding;
