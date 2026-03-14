import React, { useState, useCallback } from 'react';
import { Building2, ArrowRight, Users } from 'lucide-react';
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
  const { activeWorkspace, refetchWorkspaces } = useWorkspace();
  const [step, setStep] = useState<'name' | 'done'>('name');
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [saving, setSaving] = useState(false);

  const { createWorkspace } = useWorkspace();

  const handleCreateWorkspace = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createWorkspace(name.trim(), industry.trim() || undefined);
      setStep('done');
    } catch {
      // toast handled by context
    } finally {
      setSaving(false);
    }
  }, [name, industry, createWorkspace]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        {step === 'name' && (
          <>
            <DialogHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                <Building2 className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl">Welcome! Let's set up your business</DialogTitle>
              <DialogDescription>
                Give your workspace a name so your team knows where they are.
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
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
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
                />
              </div>
            </div>
            <Button
              onClick={handleCreateWorkspace}
              disabled={!name.trim() || saving}
              className="w-full"
            >
              {saving ? 'Creating...' : 'Create Workspace'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}

        {step === 'done' && (
          <>
            <DialogHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                <Users className="h-6 w-6" />
              </div>
              <DialogTitle className="text-xl">You're all set!</DialogTitle>
              <DialogDescription>
                Your workspace is ready. You can invite team members anytime from Settings → Workspace.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleComplete} className="w-full">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceOnboarding;
